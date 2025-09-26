import type { NextFunction, Request, Response } from "express";
import  type {  ZodError,  ZodType } from "zod";


type keyReqType = keyof Request 
type SchemaType = Partial<Record<keyReqType,ZodType>>
type ValidationError = {
    key:keyReqType,
    issues:{
        message:string,
        path:string | number | symbol | undefined;
    }[];
}[];


export const validation = ( schema:SchemaType )=>{

    return (req:Request,res:Response,next:NextFunction):NextFunction=>{

        const validationErrors:ValidationError = [];

        for(const key of Object.keys(schema) as keyReqType[]){ 
            {
                if(!schema[key]) continue;

                if(req.file){
                    req.body.attechment=req.file
                }

                if(req.files){
                    req.body.attechment=req.files
                }

                const validationResult = schema[key].safeParse(req[key]);

                if(!validationResult.success){
                    const errors = validationResult.error as ZodError
                    validationErrors.push({
                        key,
                        issues:errors.issues.map((issues)=>{
                            return{message:issues.message,path:issues.path[0]}
                        })
                    })
                }                
            }

}

        if (validationErrors.length) {
        res.status(400).json({message: "validation error",error: validationErrors,});
}


        return next() as unknown as NextFunction;

}}