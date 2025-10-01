import { NextFunction,Response,Request } from "express";
import { CommentModel } from "../../DB/models/comment.model";
import { allowCommentEnum, HPostDocument, PostModel } from "../../DB/models/post.model";
import { UserModel } from "../../DB/models/user.model";
import { CommentRepositry } from "../../DB/repositry/comment.repositry";
import { DatabaseRepositry } from "../../DB/repositry/database.repositry";
import { PostRepositry } from "../../DB/repositry/post.repositry";
import { IUser } from './../../DB/models/user.model';
import { AppError } from "../../utils/response/app.Error";
import { deleteFiles, uploadFiles } from "../../utils/aws/s3.config";
import { Types } from "mongoose";


class CommentService {

    private commentModel = new CommentRepositry(CommentModel);
    private postModel = new PostRepositry(PostModel);
    private userModel = new DatabaseRepositry<IUser>(UserModel);

    constructor(){}


    createComment = async(req:Request,res:Response,next:NextFunction)=>{

        const {postId} = req.params as unknown as {postId:Types.ObjectId};

        const post = await this.postModel.findOne({
            filter:{_id:postId,allowComment:allowCommentEnum.alow},
            
        })

        if(!post){
            throw new AppError("post not found",404);
        }





   if(req.body.tags?.length && (await this.userModel.find({filter:{_id:{$in:req.body.tags,$ne:req.user?._id}}})).length === req.body.tags?.length){
            throw new AppError("invalid tags",400);
          
        }


        let  attechment:string[] = [];

        console.log("req.files >>>", req.files);

        console.log("attechment >>>", attechment);


        if(req.files?.length){
            attechment = await uploadFiles({files:req.files as Express.Multer.File[],path:`users/${post.createBy}/posts/${post.assetsFolder}`})
        }


        const [comment] = await this.commentModel.create(
            {
                data:[
                {
                        ...req.body,
                        createBy:req.user!._id,
                        postId,
                        attechment,
                }
                ]

            }) || [];

        if(!comment){
                if(attechment.length){
                    await deleteFiles({urls:attechment});
                }
                throw new AppError("post not found",404);
            }else{
                if(req.body.removeAttechment?.length){
                await deleteFiles({urls:req.body.removeAttechment || []});
                }
            }

        console.log("req.file >>>", req.file);


        // const key = await uploadFile({
        //     file:req.file!,
        //     path:`${req.user?._id}/posts/${uuid()}_${req.file?.originalname}`,
        // })

        return res.status(201).json({message:" comment created successfully",success:true});

    }




    replayComment = async(req:Request,res:Response,next:NextFunction)=>{

        const { postId , commentId } = req.params as unknown as {
            postId:Types.ObjectId;commentId:Types.ObjectId
        };

        const comment = await this.commentModel.findOne({
            filter:{ _id:commentId , postId },
            options:{
                populate:[{path:"postId",match:{allowComment:allowCommentEnum.alow}}]
            }
            
        })

        console.log(comment);
        

        if(!comment?.postId){
            throw new AppError("post not found..........",404);
        }

   if(req.body.tags?.length && (await this.userModel.find({filter:{_id:{$in:req.body.tags,$ne:req.user?._id}}})).length === req.body.tags?.length){
            throw new AppError("invalid tags",400);
          
        }


        let  attechment:string[] = [];

        // console.log("req.files >>>", req.files);

        // console.log("attechment >>>", attechment);


        if(req.files?.length){
            const post =  comment.postId as Partial<HPostDocument>
            attechment = await uploadFiles({files:req.files as Express.Multer.File[],path:`users/${post.createBy}/posts/${post.assetsFolder}`})
        }


        const [replay] = await this.commentModel.create(
            {
                data:[
                {
                        ...req.body,
                        createBy:req.user!._id,
                        postId,
                        commentId,
                        attechment,
                }
                ]

            }) || [];

        if(!replay){
                if(attechment.length){
                    await deleteFiles({urls:attechment});
                }
                throw new AppError("post not found",404);
            }else{
                if(req.body.removeAttechment?.length){
                await deleteFiles({urls:req.body.removeAttechment || []});
                }
            }

        // console.log("req.file >>>", req.file);


        

        return res.status(201).json({message:"replay created successfully",success:true});

    }



    deleteComment = async(req:Request,res:Response,next:NextFunction)=>{
        const { commentId } = req.params as unknown as {commentId:Types.ObjectId};

        const comment = await this.commentModel.findOne({
            filter:{_id:commentId,createBy:req.user?._id}
        })
        if(!comment){
            throw new AppError("comment not found",404);
        }
        await this.commentModel.deleteOne({filter:{_id:commentId}});

        return res.status(201).json({message:"comment deleted successfully",success:true});

    }



















}


// export const commentService = new CommentService();

export default new  CommentService


