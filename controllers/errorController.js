const { render } = require("../app");
const AppError = require("../utils/appError");

const handleCastErrorDB = err=>{
    const message =`Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400)
}
const handleDuplicateFieldsDB = err=>{
   
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    console.log(value);
    const message =`Duplicate field value:${value}. Please use another value!`
    return new AppError(message  ,400 )
}

const handleValidationError = err=>{
    const errors= Object.values(err.errors).map(el=>el.message)
    const message =`Invalid input data.${errors.join('. ')}`
    return new AppError(message,400)
}

const handleJWTError =()=>
new AppError('Invalid token pleas login again',401)
 
const handleJWTExpiredError =()=>
new AppError('Your token has expired! Pleas login again',401)


//DEVELOPMENT ENVIRONMENT ERROR HANDLER
const sendErrorDev = (err, req, res) => {
    //A)API
  if(req.originalUrl.startsWith('/api')){
   return res.status(err.statusCode).json({
        status:err.status,
        error: err, 
        message: err.message,
        stack:err.stack
    });
  }
    //B)RENDERED WEBSITE
    console.error('ERROR', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    });
  };
 
//PRODUCTION ENVIRONMENT ERROR HANDLER 
const sendErrorProd=(err,req,res)=>{
    //A)API
  if(req.originalUrl.startsWith('/api')){
    //A)Operational ,trusted error:send message to clint
    if(err.isOperational){
       return res.status(err.statusCode).json({
            status:err.status,
            message: err.message,
    });
    //B)Programming or other unknown error :don't leak error details
    } 
        //1)Log error
        console.error('ERROR',err);
        //2)send generic error
      return res.status(500).json({
            status:'error',
            message:'Something went very wrong!'
        });  
  }
    //B)RENDERED WEBSITE
    //A)Operational ,trusted error:send message to clint
    if(err.isOperational){
       return res.status(err.statusCode).render('error',{
            title:'Something went wrong!',
            msg: err.message
        });
   
    }
     //B)Programming or other unknown error :don't leak error details
        //1)Log error
        console.error('ERROR',err);

        //2)send generic error
       return res.status(err.statusCode).render('error',{
            title:'Something went wrong!',
            msg: 'Please try again later'
        });
    }  

//CREATING STATUS CODE MIDDLEWARE and Exporting  app.js
module.exports =(err,req,res,next)=>{
    //console.log(err.stack);
    err.statusCode=err.statusCode || 500;
    err.status=err.status||"error";

if(process.env.NODE_ENV ==='development'){
   sendErrorDev(err,req,res)
}else if(process.env.NODE_ENV==='production'){
    let error={...err};
    error.message= err.message 

    if(error.name==='CastError') error = handleCastErrorDB(error);
    if(error.code ===11000)error= handleDuplicateFieldsDB(error);
    if(error.name==='ValidationError')error =handleValidationError(error);
    if(error.name==='JsonWebTokenError')error=handleJWTError();
    if(error.name ==='TokenExpiredError')error =handleJWTExpiredError();

    console.log(err.message);
    console.log(error.message);
   sendErrorProd(error,req,res);
} 
}; 