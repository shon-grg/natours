//if not get tour or ID Error show 404 error
class AppError extends Error{
    constructor(message,statusCode){
        super(message);

        this.statusCode =statusCode;
        this.status =`${statusCode}`.startsWith('4') ? 'fail':'error',
        this.isOperational =true;


        Error.captureStackTrace(this, this.constructor)
    }
}


//APP ERROR FUNCTION EXPORT TO APP.JS and TOUR CONTROLLER
module.exports =AppError;  