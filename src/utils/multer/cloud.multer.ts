
import { Request } from "express";
import  multer ,{FileFilterCallback} from "multer";
import { AppError } from "../response/app.Error";
import os from "os";
import {v4 as uuid} from "uuid"

 export const enum storageEnum{
    memory="memory",
    disk="disk"
}

export const fileValidation = {
    image:["image/png","image/jpeg","image/jpg","image/webp"]
}

export const cloudFileUpload = ({storageAproperties=storageEnum.memory,Validation=fileValidation.image,maxSize=2}:{storageAproperties?:storageEnum,Validation?:string[],maxSize?:number}):multer.Multer=>{

    const storage = storageAproperties===storageEnum.memory?multer.memoryStorage():multer.diskStorage({
        destination:os.tmpdir(),
        filename(req:Request,file:Express.Multer.File,cb){
            cb(null,`${uuid()}_${file.originalname}`);
        }

    });


    function fileFilter(req:Request,file:Express.Multer.File,callback:FileFilterCallback):void{
        if(!Validation.includes(file.mimetype)){
            return callback(new AppError("invalid file type",400));
        }

        callback(null,true);
    }

    
    return multer({fileFilter,limits:{fileSize:maxSize*1024*1024},storage});
}