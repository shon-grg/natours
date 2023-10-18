const mongoose=require('mongoose');
const dotenv =require('dotenv');

process.on ('uncaughtException',err=>{
    console.log('UNCAUGHT EXCEPTION: Shutting down... ');
    console.log(err.name,err.message);
    process.exit(1)      
    });


dotenv.config({ path:'./config.env'});
const app =require('./app');


//MONGO DB ATLAS PASSWORD CHECKING
const DB=process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

//MONGO DB CONNECTION STRING
mongoose
//.connect(process.env.DATABASE_LOCAL,{
.connect(DB,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    family:4
   
//     useCreateIndex:true,
//     useFindAndModify:false
 })
.then(con=>console.log('DB Connection successful!'))

 
 //PORT & It's ERROR HANDLER
const port =process.env.PORT ||3000;
const server=app.listen(port,()=>{
    console.log(`App running on port ${port}...`);
}); 
 
process.on('unhandledRejection',err=>{
    console.log('UNHANDIER REJECTION: Shutting down... ');
    console.log(err.name,err.message);
    server.close(()=>{
    process.exit(1)      
    })
   });      


