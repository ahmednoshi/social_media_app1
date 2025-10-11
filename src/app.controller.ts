import{ resolve} from 'node:path'
import{config} from 'dotenv';

config({
    path:resolve("./config/.env.development")
})


import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {rateLimit} from'express-rate-limit';
import userRouter from './modules/user/user.controller';
import { AppError } from './utils/response/app.Error';
import connectionDB from './DB/connection';
import postRouter from './modules/post/post.controller';
import multer from 'multer';
import commentRouter from './modules/comment/comment.controller';
import { initializeIo } from './modules/gateway/getway';


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    // standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    // legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes',
    statusCode: 429, // 429 status = Too Many Requests (RFC 6585)
})

export const bootstarap = async ():Promise<void>=>{
    const app:Express = express();
    app.use(express.json());    
    // const upload = multer();
    // app.use(upload.none()); 



    const PORT:number | string = process.env.PORT || 5000;



    app.use(cors(),helmet(),limiter);

    app.use("/user",userRouter);
    app.use("/post",postRouter);
    app.use("/comment",commentRouter);

    


    app.get('/', (req:Request, res:Response) => {
        res.send(`welcome to ${process.env.APPLICATION_NAME} ❤️ 🐉`);
    });





    app.use("{/*dummy}",(req:Request,res:Response)=>{
        throw new AppError("route not found",404);
    })



    app.use((err:AppError,req:Request,res:Response,next:NextFunction)=>{
        return res.status(err.statusCode as unknown as number || 500).json({
            message:err.message || "something went wrong",
            stack:process.env.MOOD === "development" ? err.stack:undefined,
            error:err
        });
    })



    await connectionDB();




    const httpServer =  app.listen(PORT, () => {
        console.log(`Example app listening on ${PORT} !!!!`);
    });


    initializeIo(httpServer);




}