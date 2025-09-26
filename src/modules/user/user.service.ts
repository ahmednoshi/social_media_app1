import { Request, Response } from "express";
import { CreateUserDto, LoginUserDto } from "./user.dto";
import { DatabaseRepositry } from "../../DB/repositry/database.repositry";
// import {  Model } from "mongoose";
import { HUserDocument, IUser, RoleEnum, UserModel } from "../../DB/models/user.model";
import { AppError } from "../../utils/response/app.Error";
import { compareHash, generateHash } from './../../utils/security/hash.security';
import emailEvent from "../../utils/event/email.event";
import { generateOtp } from "../../utils/otp";
import { createCredentialToken, createRevokeToken, LogoutEnum } from './../../utils/security/token.security';
import { UpdateQuery } from "mongoose";
import {  TokenModel } from "../../DB/models/token.model";
import { tokenRepositry } from "../../DB/repositry/token.repositry";
import { JwtPayload } from "jsonwebtoken";


class UserService {
    private userModel = new DatabaseRepositry<IUser>(UserModel);
    private tokenModel = new tokenRepositry(TokenModel);


    signUp = async (req:Request,res:Response):Promise<Response>=>{ 

        const {firstName,lastName,email,password,role}:CreateUserDto = req.body;


        const otp = generateOtp();

        const [user] = await this.userModel.create({

            data:[{firstName,lastName,email,role,password,confirmEmailOtp: `${String(otp)}`}],
            options:{validateBeforeSave:true},
        })||[];

        if(!user){
           throw new AppError("fail to create user",404);
        }



        // emailEvent.emit("confirmEmail",{to:email,otp});



        return res.status(201).json({message:"user created successfully",data:{user}});

    }

    confirmEmail= async (req:Request,res:Response):Promise<Response>=>{

        const {email,otp} = req.body;

        const user = await this.userModel.findOne({
            filter:{
                email,
                confirmEmailOtp:{$exists:true},
                confirmAT:{$exists:false},
            }
        });


        if(!user){
            throw new AppError("user not found",404);
        }

        if(!await compareHash(otp,user.confirmEmailOtp as string)){
            throw new AppError("invalid otp",400);
        }

        await this.userModel.updateOne(
            {
                filter:{email},
                update:{
                    confirmAT:new Date(),
                    $unset:{confirmEmailOtp:true}
                }
            }
        )



        return res.status(200).json({message:"email confirmed successfully"});




    }

    login = async (req:Request,res:Response):Promise<Response>=>{


        const {email,password}:LoginUserDto = req.body;

        const user = await this.userModel.findOne({
            filter:{email}
        });

        if(!user){
            throw new AppError("user not found",404);
        }

        if(!user.confirmAT){
            throw new AppError("email not confirmed",400);
        }


        if(!await compareHash(password,user.password)){
            throw new AppError("invalid password",400);
        }

        const Credentials = await createCredentialToken(user);


        return res.status(200).json({message:"login successfully",data:{Credentials}});








    }


    logout = async (req:Request,res:Response):Promise<Response>=>{
        const {flag} = req.body;

        const update:UpdateQuery<IUser> = {}
        switch(flag){
            case LogoutEnum.all:
                update.changeCredentialTime= new Date();
                break;
                default:
                    await createRevokeToken(req.decoded as JwtPayload);

                    break;

        }

        await this.userModel.updateOne({
            filter:{_id:req.decoded?._id},
            update,
        })


        return res.status(200).json({message:"logout successfully"});





    }


    refreshToken = async (req:Request,res:Response):Promise<Response>=>{

        const Credentials = await createCredentialToken(req.user as HUserDocument);

        await createRevokeToken(req.decoded as JwtPayload);

        return res.status(201).json({message:"refresh token successfully",data:{Credentials}});



    }


    sendForgetPasswordOtp = async (req:Request,res:Response):Promise<Response>=>{

        const {email} = req.body;

        const user = await this.userModel.findOne({
            filter:{email,confirmAT:{$exists:true}}
        });

        if(!user){
            throw new AppError("user not found",404);
        }

        const otp = generateOtp();

        const result = await this.userModel.updateOne({
            filter:{email},
            update:{
                resetPasswordOtp:await generateHash(String(otp))}
        })

        if(!result.modifiedCount){
            throw new AppError("fail to send otp",400);
        }



        emailEvent.emit("resetPassword",{to:email,otp});



        return res.status(200).json({message:"otp sent successfully"});



    }


    verifyForgetPasswordOtp = async (req:Request,res:Response):Promise<Response>=>{
        const {email,otp} = req.body;


        const user = await this.userModel.findOne({
            filter:{email,resetPasswordOtp:{$exists:true}}
        });


        if(!user){
            throw new AppError("user not found",404);
        }


        if(!await compareHash(otp,user.resetPasswordOtp as string)){
            throw new AppError("invalid otp",400);
        }

        return res.status(200).json({message:"otp verified successfully"});



    }


    resetForgetPasswordOtp= async (req:Request,res:Response):Promise<Response>=>{

        const {email,otp,password} = req.body;



        const user = await this.userModel.findOne({
            filter:{email,resetPasswordOtp:{$exists:true}}
        });

        if(!user){
            throw new AppError("user not found",404);
        }


        if(!await compareHash(otp,user.resetPasswordOtp as string)){
            throw new AppError("invalid otp",400);
        }



        await this.userModel.updateOne({
            filter:{email},
            update:{
                password:await generateHash(password),
                changeCredentialTime:new Date(),
                $unset:{resetPasswordOtp:true},
            }
        })




        return res.status(200).json({message:"password reset successfully"});



    }


    freezeUser = async (req:Request,res:Response):Promise<Response>=>{

        const {id} = req.params;

        if (!id && req.user?.role !== RoleEnum.admin) {
            throw new AppError("unauthorized", 401);
        }

        await this.userModel.findOneAndUpdate({
            filter:{_id:id || req.user?._id},
            update:{
                freezeAT:true,
                changeCredentialTime:new Date(),
                $set:{freezeBy:req.user?._id}
            },
            options:{new:true}
        })

        return res.status(200).json({message:"user freeze successfully"});
        
    }


    changePassword = async (req:Request,res:Response):Promise<Response>=>{

        const {password,newPassword,confirmPassword} = req.body;


        const user = await this.userModel.findById({id:req.user?._id, projection: "+password"}); 


        if(!await compareHash(password,user?.password as string)){
            throw new AppError("invalid password",400);
        }


        if(newPassword !== confirmPassword){
            throw new AppError("passwords do not match",400);
        }



        await this.userModel.findOneAndUpdate({
            filter:{_id:req.user?._id},
            update:{password:await generateHash(newPassword),changeCredentialTime:new Date()}
        })

        return res.status(200).json({message:"password changed successfully"});


    }

    


}


export default new UserService;