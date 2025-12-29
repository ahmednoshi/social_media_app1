import  { Request, Response } from "express";
import { CreateUserDto, LoginUserDto } from "./user.dto";
import { DatabaseRepositry } from "../../DB/repositry/database.repositry";
// import {  Model } from "mongoose";
import { GenderEnum, HUserDocument, IUser, RoleEnum, UserModel } from "../../DB/models/user.model";
import { AppError } from "../../utils/response/app.Error";
import { compareHash, generateHash } from './../../utils/security/hash.security';
import emailEvent from "../../utils/event/email.event";
import { generateOtp } from "../../utils/otp";
import { createCredentialToken, createRevokeToken, LogoutEnum } from './../../utils/security/token.security';
import { Types, UpdateQuery } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { PostModel } from './../../DB/models/post.model';
import { PostRepositry } from "../../DB/repositry/post.repositry";
import { friendsRequestRepositry } from "../../DB/repositry/friendsRequest.repositry";
import { friendsRequestModel, statusEnum } from "../../DB/models/friends.Request.model";
import { ChatRepositry } from "../../DB/repositry/chat.repositry";
import { ChatModel } from "../../DB/models/chat.model";


class UserService {
    private userModel = new DatabaseRepositry<IUser>(UserModel);
    private postModel = new PostRepositry(PostModel);
    private friendsRequestModel = new friendsRequestRepositry( friendsRequestModel)
    private chatmodel = new ChatRepositry(ChatModel)


    signUp = async (req:Request,res:Response):Promise<Response>=>{ 

        const {firstName,lastName,email,password,role,}:CreateUserDto = req.body;


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

        if(user.twoStepVerification===false){
                    const Credentials = await createCredentialToken(user);
                    return res.status(200).json({message:"login successfully",data:{Credentials}});
        }else{
            const otp = generateOtp();
            await this.userModel.findOneAndUpdate({
                filter:{_id:user._id},
                update:{twoStepVerificationCode:`${String(otp)}`},
                options:{new:true}
            })
            return res.status(200).json({message:"two step verification code sent to your email"});

        }

        // return res.status(200).json({message:"login successfully",data:{Credentials}});








    }


    verifyLoginOtp = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp } = req.body as { email: string; otp: string };

    const user = await this.userModel.findOne({ filter:{ email } });

    if (!user) {
        throw new AppError("user not found", 404);
    }

    if(!await compareHash(otp as string,user.twoStepVerificationCode as string)){
            throw new AppError("invalid otp",400);
    }


    await this.userModel.findOneAndUpdate({
        filter:{ _id: user._id },
        update:{ $unset: { twoStepVerificationCode: 1 } },
        options:{ new: true }
    });

    const Credentials = await createCredentialToken(user);

    return res.status(200).json({ 
        message: "login successful",
        data: { Credentials }
    });
};



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


    dashBorad = async (req:Request,res:Response):Promise<Response>=>{

        const result = await Promise.allSettled([
            this.userModel.find({filter:{}}),
            this.postModel.find({filter:{}}),
        ])

        return res.status(200).json({message:"dashboard",data:{result}});

    }

    changeRole = async (req:Request,res:Response):Promise<Response>=>{
        const {userId} = req.params as unknown as {userId:Types.ObjectId};
        const {role}:{role:RoleEnum} = req.body as unknown as {role:RoleEnum};

        const denyRloes:RoleEnum[]= [role,RoleEnum.superAdmin];
        if(req.user?.role === RoleEnum.admin){
            denyRloes.push(RoleEnum.admin);
        }

        const user = await this.userModel.findOneAndUpdate({
            filter:{_id:userId as Types.ObjectId ,role:{$nin:denyRloes}},
            update:{role},
            options:{new:true}
        })
        console.log( user, userId,role);
        
        if(!user){
            throw new AppError("user not found",404);
        }

        return res.status(200).json({message:"role changed successfully"});

    }


    sendFreindsRequest = async (req:Request,res:Response):Promise<Response>=>{

        const {userId} = req.params as unknown as {userId:Types.ObjectId};

        const freindsRequestExists = await this.friendsRequestModel.findOne({
            filter:{
                createBy:{$in:[req.user?._id , userId]},
                senderTo:{$in:[req.user?._id , userId]},
            }
                })



                if(freindsRequestExists){
                    throw new AppError("freinds request already exists",400);
                }


                const user = await this.userModel.findOne({
                    filter:{_id:userId}
                })

                if(!user){
                    throw new AppError("user not found",404);
                }

                const [freindsRequest] = await this.friendsRequestModel.create({
                    data:[{
                        createBy:req.user?._id as Types.ObjectId,
                        senderTo:userId,
                        status:statusEnum.pending
                    }]
                }) || []

                if(!freindsRequest){
                    throw new AppError("fail to send freinds request",400);
                }

                return res.status(200).json({message:"freinds request sent successfully",data:{freindsRequest}});
    }


    acceptFreindsRequest = async (req:Request,res:Response):Promise<Response>=>{
        const {id} = req.params as unknown as {id:Types.ObjectId};

        const freindsRequest = await this.friendsRequestModel.findOneAndUpdate({
            filter:{_id:id,senderTo:req.user?._id,status:statusEnum.pending},
            update:{accepted:new Date(),status:statusEnum.accepted},
            options:{new:true}
        })

        if(!freindsRequest){
            throw new AppError("freinds request not found",404);
        }


        await Promise.all([
            await this.userModel.updateOne({
                filter:{_id:freindsRequest.createBy},
                update:{$addToSet:{friends:freindsRequest.senderTo}}
            }),

            await this.userModel.updateOne({
                filter:{_id:freindsRequest.senderTo},
                update:{$addToSet:{friends:freindsRequest.createBy}}
            })
        ])

        return res.status(200).json({message:"freinds request accepted successfully"});

    }



    reSendOtp = async (req:Request,res:Response):Promise<Response>=>{

        const {email} = req.body as unknown as {email:string};


        const user = await this.userModel.findOne({
            filter:{email,confirmAT:{$exists:false}}
        })

        if(!user){
            throw new AppError("user not found",404);
        }

        const otp = await generateOtp();


        await this.userModel.findOneAndUpdate({
            filter:{email,confirmAT:{$exists:false}},
            update:{confirmEmailOtp:`${String(otp)}`},
            options:{new:true}
        })


        // await user.save();


        return res.status(200).json({message:"otp re-send successfully",});

    }


    shareProfile = async (req:Request,res:Response):Promise<Response>=>{
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        return res.status(200).json({ message: fullUrl });
    }


    unFreezeUser = async (req:Request,res:Response):Promise<Response>=>{

        const {userId} = req.params as unknown as {userId:Types.ObjectId};

        if(req.user?.role !== RoleEnum.superAdmin && req.user?.role !== RoleEnum.admin){
            throw new AppError("only super admin and admin can unfreeze user",403);
        }

        const user = await this.userModel.findOneAndUpdate({
            filter:{_id:userId,freeze:true},
            update:{
                $unset:{freezeAt:1,freezeBy:1},
                reStoreAt:new Date(),
                reStoreBy:req.user?._id
            },
            options:{new:true}
        })

        if(!user){
            throw new AppError("user not found",404);
        }

        return res.status(200).json({message:"user unfrozen successfully"});

    }


    updateEamil = async (req:Request,res:Response):Promise<Response>=>{
        const {email} = req.body as unknown as {email:string};
        const { userId } = req.params as { userId?: string };

        if(!email){
            throw new AppError("email is required",400);
        }

    let targetUserId: Types.ObjectId = req.user!._id;

    if (req.user?.role === RoleEnum.admin || req.user?.role === RoleEnum.superAdmin) {
    
        if (userId) {
            targetUserId = new Types.ObjectId(userId);
        }
    } else {
        if (userId && !new Types.ObjectId(userId).equals(req.user?._id)) {
            throw new AppError("only super admin and super admin can update other users' email", 403);
        }
    }


        const user = await this.userModel.findOneAndUpdate({
            filter:{_id:targetUserId},
            update:{email},
            options:{new:true}
        })


        if(!user){
            throw new AppError("user not found",404);
        }


        return res.status(200).json({message:"email updated successfully"});


    }



    updateProfile = async (req:Request,res:Response):Promise<Response>=>{
        const {firstName,lastName,gender} = req.body as unknown as {firstName?:string,lastName?:string,gender?:GenderEnum};

        const { userId } = req.params as { userId?: string };       

        let targetUserId: Types.ObjectId = req.user!._id;

        if (req.user?.role === RoleEnum.admin || req.user?.role === RoleEnum.superAdmin) {

            if (userId) {
                targetUserId = new Types.ObjectId(userId);
            }

        } else {

            if (userId && !new Types.ObjectId(userId).equals(req.user?._id)) {

                throw new AppError("only super admin and super admin can update other users' profile", 403);
            }
        }
        const user = await this.userModel.findOneAndUpdate({

            filter:{_id:targetUserId},
            update:{firstName,lastName,gender},
            options:{new:true}
        })

        if(!user){
            throw new AppError("user not found",404);
        }

        return res.status(200).json({message:"profile updated successfully",data:{user}});

    }


    twoStepVerification = async (req:Request,res:Response):Promise<Response>=>{
        const {email , password } = req.body as unknown as {email:string,password:string};

        if(!email || !password){
            throw new AppError("email and password are required",400);
        }

        const user = await this.userModel.findOne({
            filter:{email}
        })

        if(!user){
            throw new AppError("user not found",404);
        }
        if(!await compareHash(password,user.password)){
            throw new AppError("invalid password",400);
        }

        const otp = generateOtp();

        await this.userModel.findOneAndUpdate({
            filter:{_id:user?._id},
            update:{twoStepVerificationCode:`${String(otp)}`},
            options:{new:true , runValidators: true }
        })


        return res.status(200).json({message:"otp sent successfully"});






    }


    verifyTwoStepVerification = async (req:Request,res:Response):Promise<Response>=>{
        const userId = req.user?._id;
        const {email,otp} = req.body 

        if(!email || !otp){
            throw new AppError("email and otp are required",400);
        }

        const user = await this.userModel.findOne({
            filter:{email,twoStepVerificationCode:{$exists:true},_id:userId}
        })

        if(!user){
            throw new AppError("user not found",404);
        }

        if(!await compareHash(otp,user.twoStepVerificationCode as string)){
            throw new AppError("invalid otp",400);
        }

        await this.userModel.findOneAndUpdate({
            filter:{_id:user?._id},
            update:{twoStepVerification:true,$unset:{twoStepVerificationCode:1}},
            options:{new:true}
        })

        return res.status(200).json({message:"otp verified successfully"});


    }



    getProfile = async (req:Request,res:Response):Promise<Response>=>{
        const  user = await this.userModel.findOne({
            filter:{_id:req.user?._id},
            options:{populate:{path:"friends" ,select:"firstName lastName email gender"}}
        })

        const groups = await this.chatmodel.find({
            filter:{participants:{$in:[req.user?._id]}}
        })
          

        return res.status(200).json({message:"Done",success:true,data:{user,groups}});
    }


    blockUser = async (req:Request,res:Response):Promise<Response>=>{

        const {userId} = req.params as unknown as {userId:Types.ObjectId};

        if(req.user?._id.equals(userId)){
            throw new AppError("you can not block yourself",400);
        }

        const userToBlock = await this.userModel.findOne({
            filter:{_id:userId}
        });
        
        if (!userToBlock) {
        throw new AppError("user to block not found", 404);
        }   



        const user = await this.userModel.findOneAndUpdate({
            filter:{_id:req.user?._id},
            update:{$addToSet:{blockedUsers:userId},$pull:{friends:userId}},
            options:{new:true}
        })

        await this.userModel.updateOne({
            filter:{_id:userId},
            update:{$pull:{friends:req.user?._id}}
        })


        
        if(!user){
            throw new AppError("user not found",404);
        }

        return res.status(200).json({message:"user blocked successfully"});
    }



    deleteFrinedsRequest = async (req:Request,res:Response):Promise<Response>=>{

        const {id} = req.params as unknown as {id:Types.ObjectId};


        const freindsRequest = await this.friendsRequestModel.findOne({
            filter:{_id:id,$or:[{createBy:req.user?._id},{senderTo:req.user?._id}]}
        })

        if(!freindsRequest){
            throw new AppError("freinds request not found",404);
        }

        await this.friendsRequestModel.deleteOne({filter:{_id:id}});


        return res.status(200).json({message:"freinds request deleted successfully"});
    }



    unFrineds = async (req:Request,res:Response):Promise<Response>=>{
        const {id} = req.params as unknown as {id:Types.ObjectId};


        const friendsRequset = await this.friendsRequestModel.findOne({
            filter:{_id:id,$or:[{createBy:req.user?._id},{senderTo:req.user?._id}],status:statusEnum.accepted}
        })

        if(!friendsRequset){
            throw new AppError("freinds request not found",404);
        }


        const user = await this.userModel.findOneAndUpdate({
            filter:{_id:friendsRequset.senderTo as Types.ObjectId},
            update:{$pull:{friends:friendsRequset.createBy as Types.ObjectId}},
            options:{new:true}
        })

        await this.userModel.findOneAndUpdate({
            filter:{_id:friendsRequset.createBy as Types.ObjectId},
            update:{$pull:{friends:friendsRequset.senderTo as Types.ObjectId}},
            options:{new:true}
        })

        

        if(!user){
            throw new AppError("user not found",404);
        }




        return res.status(200).json({message:"Done"});
    }


















    }



export default new UserService;