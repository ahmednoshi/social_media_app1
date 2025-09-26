
import {  DeleteObjectsCommand, DeleteObjectsCommandOutput, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"; 
import {v4 as uuidv4} from "uuid"
import { storageEnum } from "../multer/cloud.multer";
import { createReadStream } from "node:fs";
import { AppError } from "../response/app.Error";
import { Upload } from "@aws-sdk/lib-storage";


export const s3Client = ()=>{
    return new S3Client({
        region: process.env.AWS_REGION!,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,

        }
    }) ;
}


export const uploadFile = async ({
    storageType = storageEnum.memory,
    Bucket=process.env.AWS_BUCKET_NAME!,
    path="General",
    file,
    ACL="private" as ObjectCannedACL,
    
}:{
    storageType?:storageEnum
    Bucket?:string,
    path:string,
    file:Express.Multer.File
    ACL?:ObjectCannedACL
}):Promise<string>=>{

    const command = new PutObjectCommand({
        Bucket,
        ACL,
        Key:`${process.env.APPLICATION_NAME}/${path}/${uuidv4()}_${file.originalname}`,
        Body:storageType===storageEnum.memory?file.buffer:createReadStream(file.path),
        ContentType:file.mimetype,

    })

    await s3Client().send(command)
    if(!command.input.Key){
        throw new AppError("File not uploaded",500)

    }

    return command.input.Key

}


export const uploadLargeFile = async ({
    storageType = storageEnum.memory,
    Bucket=process.env.AWS_BUCKET_NAME!,
    path="General",
    file,
    ACL="private" as ObjectCannedACL,
    
}:{
    storageType?:storageEnum
    Bucket?:string,
    path:string,
    file:Express.Multer.File
    ACL?:ObjectCannedACL
}):Promise<string>=>{

    const upload = new Upload({
        client:s3Client(),
        params:{
                Bucket,
                ACL,
                Key:`${process.env.APPLICATION_NAME}/${path}/${uuidv4()}_${file.originalname}`,
                Body:storageType===storageEnum.memory?file.buffer:createReadStream(file.path),
                ContentType:file.mimetype,
        
        }

    })

    upload.on("httpUploadProgress", (progress) => {
    console.log(progress);
  });

    const {Key} = await upload.done();

     if(!Key){
        throw new AppError("File not uploaded",500)

    }

    return Key


}


export const uploadFiles = async ({
    storageType = storageEnum.memory,
    Bucket=process.env.AWS_BUCKET_NAME!,
    path="General",
    files,
    ACL="private" as ObjectCannedACL,
    useLarge = false ,
    
}:{
    storageType?:storageEnum
    Bucket?:string,
    path:string,
    files:Express.Multer.File[]
    ACL?:ObjectCannedACL,
    useLarge?:boolean
})=>{

    let urls :string[] = [];
    if(useLarge === false){
        urls = await Promise.all(files.map(file=>uploadFile({storageType,Bucket,path,file,ACL})));
    }else{
        urls = await Promise.all(files.map(file=>uploadLargeFile({storageType,Bucket,path,file,ACL})));
    }

    return urls

}



export const deleteFiles = async({
    Bucket=process.env.AWS_BUCKET_NAME as string,
    urls,
    Quiet=false
}:{
    Bucket?:string
    urls:string[],
    Quiet?:boolean
}):Promise<DeleteObjectsCommandOutput> =>{
    const Objects = urls.map(url=>({Key:url}));
    const command = new DeleteObjectsCommand({
        Bucket,
        Delete:{
            Objects,
            Quiet,
        }

    })

    return await s3Client().send(command);

}