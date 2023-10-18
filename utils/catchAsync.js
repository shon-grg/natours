//the error handler is provide 400 error fail
module.exports =fn=>{
    return(req,res,next)=>{
 fn(req ,res, next).catch(next);       
    };
};
//this function is export to tour controller