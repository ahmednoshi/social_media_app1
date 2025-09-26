

export class AppError extends Error {
constructor(public override message:any,public statusCode:number){
        super(message);
        this.statusCode = statusCode;
    }
}