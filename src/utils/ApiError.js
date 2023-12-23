class ApiError extends Error{
    constructor(statusCode,
        message="something wents wrong",
        errors=[],
        statck
        ){
            super(message)
            this.statusCode=statusCode;
            this.errors=errors;
            this.message=message
            this.success=false;
            this.data=null;

            if(statck){
                this.stack=statck
            }
            else{
                    Error.captureStackTrace(this,this.Constructor)
            }
    }
}

export {ApiError};