import type { NextFunction ,Response  ,Request} from "express"
import { decodeToken, tokenTypeEnum } from "../utils/security/token.security";
import { RoleEnum } from "../DB/models/user.model";


export const authentication=(tokenType:tokenTypeEnum=tokenTypeEnum.access)=>{
    return async  (req:Request,res:Response,next:NextFunction)=>{
        if(!req.headers.authorization){
            throw new Error("token is required");
        }

        const {decoded,user} = await decodeToken({authorization:req.headers.authorization,tokenType});

        req.user = user;
        req.decoded = decoded;

        next();
    }
}





export const authorization=(accessRole:RoleEnum[]=[],tokenType:tokenTypeEnum=tokenTypeEnum.access)=>{
    return async  (req:Request,res:Response,next:NextFunction)=>{
        if(!req.headers.authorization){
            throw new Error("token is required");
        }

        const {decoded,user} = await decodeToken({authorization:req.headers.authorization,tokenType});


        if(!accessRole.includes(user.role)){
            throw new Error("unauthorized");
        }

        req.user = user;
        req.decoded = decoded;

        next();
    }
}