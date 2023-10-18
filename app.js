const path =require('path')
const express =require('express');
const morgan =require('morgan')
const rateLimit =require('express-rate-limit')
const helmet =require('helmet')
const mongoSanitize =require('express-mongo-sanitize')
const xss =require('xss-clean')
const hpp =require('hpp')
const cookieParser =require('cookie-parser')
const compression =require('compression')
const cors =require('cors')

const AppError =require('./utils/appError');
const globalErrorHandler= require('./controllers/errorController')
const tourRouter =require('./routes/tourRouts');
const userRouter =require('./routes/userRouts');
const reviewRouter=require('./routes/reviewRouts');
const bookingRouter=require('./routes/bookingRouts');
const viewRouter =require('./routes/viewRouts')

// Start express application
const app =express();
 
// app.enable('trust proxy');

app.set('view engine','pug');
app.set ('views',path.join(__dirname,'views')) 
     
app.use(cors()) 
app.options('*', cors());
   
//GLOBAL MIDDLEWARE 
//Serving static files 
app.use(express.static(path.join(__dirname,'public')));

//Set Security HTTP headers
 app.use(helmet({
    contentSecurityPolicy:false,
    crossOriginEmbedderPolicy: false
}))

//Development login
if(process.env.NODE_ENV ==='development'){ 
    app.use (morgan('dev'));
}

//Limit requests from same API
const limiter =rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'To many request from this IP,Please try again in an hour!'
});
app.use('/api',limiter);


//Body parser,reading data from body into req.body 
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

  

//Data sanitization against NoSQL query Injection
app.use(mongoSanitize());

//Data sanitization against xss 
app.use(xss()) 

//Prevent parameter pollution 
app.use(hpp({
    whitelist:[
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

app.use (compression())

//Test middleware
app.use((req,res,next)=>{
    req.requestTime =new Date().toISOString();
    // console.log(req.cookies)
    next();
})      

//ROUTES
app.use('/',viewRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter); 
app.use('/api/v1/bookings',bookingRouter);



app.all('*',(req,res,next)=>{
next(new AppError(`Can't find ${req.originalUrl} on this server` ,404));  
});  

app.use(globalErrorHandler)

//EXPORT TO SERVER
module.exports =app;
