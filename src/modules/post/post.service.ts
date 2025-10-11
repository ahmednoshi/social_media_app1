
import { NextFunction,Response,Request } from "express";
import { availapilityEnum, PostModel, reactionEnum } from "../../DB/models/post.model"
import { IUser, RoleEnum, UserModel } from "../../DB/models/user.model";
import { DatabaseRepositry } from "../../DB/repositry/database.repositry";
import { AppError } from "../../utils/response/app.Error";
import {  deleteFiles, uploadFiles } from "../../utils/aws/s3.config";
import {v4 as uuid} from "uuid"
import { ObjectId, Types } from "mongoose";
import { PostRepositry } from './../../DB/repositry/post.repositry';
import { CommentRepositry } from "../../DB/repositry/comment.repositry";
import { CommentModel } from "../../DB/models/comment.model";
import emailEvent from "../../utils/event/email.event";
export const PostAvailability = (req:Request)=>{
    return [
        {availability:availapilityEnum.public},
        {availability:availapilityEnum.private,createBy:req.user?._id},
        {availability:availapilityEnum.friends,createBy:{$in:[...(req.user?.friends  || []),req.user?._id]}}
    ]

}

class PostService{
    private userModel = new DatabaseRepositry<IUser>(UserModel);
    private postModel = new PostRepositry(PostModel);
    private commentModel = new CommentRepositry(CommentModel);
    constructor(){}


    createPost = async (req:Request,res:Response,next:NextFunction)=>{


        // let tags = req.body.tags;


        // if (typeof tags === "string") {
        // tags = [tags];
        //      }

        // if(req.body.tags?.length
        //     && (await this.userModel.find({filter:{_id:{$in:req.body.tags}}})).length !== req.body.tags?.length
        //     ){
        //         throw new AppError("invalid tags",400);
        // }

        if(req.body.tags?.length && (await this.userModel.find({filter:{_id:{$in:req.body.tags,$ne:req.user?._id}}})).length === req.body.tags?.length){
            throw new AppError("invalid tags",400);
          
        }




        let  attechment:string[] = [];
        let assetsFolder:string = uuid();

        console.log("req.files >>>", req.files);

        console.log("attechment >>>", attechment);


        if(req.files?.length){
            attechment = await uploadFiles({files:req.files as Express.Multer.File[],path:`users/${req.user!._id}/posts/`})
        }


        const [post] = await this.postModel.create(
            {
                data:[
                {
                        ...req.body,
                        assetsFolder,
                        createBy:req.user!._id,
                        attechment,
                }
                ]

            }) || [];


        if (post?.tags?.length) {
        const taggedUsers = await this.userModel.find({
            filter: { _id: { $in: post.tags } }
        });

            taggedUsers.forEach(user => {
                emailEvent.emit("some one mentioned you", {
            to: user.email, // هنا بقى عندك الايميل
            mentionedBy: req.user?.username || "Someone",
            postContent: post.description,
            postLink: `http://localhost:3000/posts/${post._id}`
    });
    });
}


        if(!post){
            throw new AppError("fail to create post",400);
        }

        console.log("req.file >>>", req.file);


        // const key = await uploadFile({
        //     file:req.file!,
        //     path:`${req.user?._id}/posts/${uuid()}_${req.file?.originalname}`,
        // })

        return res.status(201).json({message:"post created successfully"});

    }



    likesPost = async (req:Request,res:Response,next:NextFunction)=>{
        const {postId} = req.params as {postId:string};
        const userId = req.user?._id;
        const {reaction} = req.body ;

        // const post = await this.postModel.findOneAndUpdate(
        //     {
        //         filter:{
        //             _id:postId,
        //             // $or:PostAvailability(req),

        //         },
        //         update:{$addToSet:{likes:req.user!._id}},
        //     }
        // )


        if(!reaction){
            await this.postModel.updateOne({
                filter:{_id:postId},
                update:{
                    $pull:{likes:{userId}}
                }
            })
            return res.status(200).json({message:"post unliked successfully"});
        }

        const post = await this.postModel.findOne({
            filter:{
                _id:postId,
                // , $or:PostAvailability(req)
            },
        })

        if(!post){
            throw new AppError("post not found",404);
        }


        let postExist =post.likes!.findIndex((reaction)=>{
            return reaction.userId.toString() == userId!.toString()
        })

        if(postExist == -1 )
            await this.postModel.updateOne({
            filter:{_id:postId},
            update:{
                $push:{likes:{
                    reaction,
                    userId
                }}
            }
        })
        else{
            await this.postModel.updateOne({
                filter:{_id:postId,"likes.userId":userId}, 
                update:{
                    $set:{"likes.$.reaction":reaction} // $ for  i have more than value like as likes[0],likes[1]
                },
                
            })
        }




        return res.status(200).json({message:"post liked successfully"});
    }
    


    disLike = async (req:Request,res:Response,next:NextFunction)=>{
        const {postId} = req.params as {postId:string};

        const post = await this.postModel.findOneAndUpdate(
            {
                filter:{_id:postId
                    // , $or:PostAvailability(req)
                },
                update:{$pull:{likes:req.user!._id}},
            }
        )

        if(!post){
            throw new AppError("post not found",404);
        }


        return res.status(200).json({message:"post disliked successfully"});

    }



// toggleLike = async (req: Request, res: Response, next: NextFunction) => {
//   const { postId } = req.params as { postId: string };

//   const post = await this.postModel.findById({ id: postId });
//   if (!post) throw new AppError("post not found", 404);

//   const userId = req.user!._id;
//   const alreadyLiked = post.likes?.includes(userId);

//   const updatedPost = await this.postModel.findOneAndUpdate({
//     filter: {_id: postId},
//     update: alreadyLiked
//       ? { $pull: { likes: userId } } 
//       : { $addToSet: { likes: userId } }, 
//     options: { new: true }
//   });

//   return res.status(200).json({
//     message: alreadyLiked
//       ? "post disliked successfully"
//       : "post liked successfully",
//     likesCount: updatedPost?.likes?.length,
//   });
// };



    updatePost = async (req:Request,res:Response,next:NextFunction)=>{

        const {postId} = req.params as unknown as {postId:ObjectId};

        const post  = await this.postModel.findOne({
            filter:{
                _id:postId,
                createBy:req.user!._id
            }
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
            attechment = await uploadFiles({files:req.files as Express.Multer.File[],path:`users/${post.createBy._id}/posts/${post.assetsFolder}`})
        }


        const update = await this.postModel.updateOne({
            filter:{_id:post._id},
            update:[
            {
                $set:{
                description:req.body.description,
                allowComment:req.body.allowComment || post.allowComment,
                availapility:req.body.availapility || post.availapility,
                attechment:{
                    $setUnion:[
                        {
                            $setDifference:[
                                "$attechment",
                                req.body.removeAttechment || [],
                            ],
                        },
                        attechment,
                    ]
                },
                tags:{
                    $setUnion:[
                        {
                            $setDifference:[
                                "$tags",
                                (req.body.removedTags || []).map((tag:string)=>{
                                    return Types.ObjectId.createFromHexString(tag);
                                }),
                            ],
                        },
                    (req.body.tags || []).map((tag:string)=>{
                                    return Types.ObjectId.createFromHexString(tag);
                                }),
                    ]
                }


                }
            }
            ]
        })


        if(!update.matchedCount){
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


        return res.status(201).json({message:"post updated successfully"});

    }


    getPost = async (req:Request,res:Response,next:NextFunction)=>{
        let {page , size} = req.query as unknown as {page:number,size:number};

        const post = await this.postModel.paginate({
            filter : {
                createBy:req.user!._id
            },
            options:{
                populate:[{path:"comments",match:{commentId:{$exists:false},freezedAt:{$exists:false}},

                    populate:[{path:"replay",match:{commentId:{$exists:false},freezedAt:{$exists:false}}}]
                
                }]
            },
            page,
            size,
        })


        return res.status(200).json({
            message:"Done",
            success:true, 
            data:post
        });










}


    deletePost = async (req:Request,res:Response,next:NextFunction)=>{
        const {postId} = req.params as unknown as {postId:Types.ObjectId};

        const post = await this.postModel.findOne({
            filter:{_id:postId,createBy:req.user?._id}
        })
        if(!post){
            throw new AppError("post not found",404);
        }

        await this.postModel.deleteOne({filter:{_id:postId}});

        return res.status(200).json({message:"post deleted successfully"});

}


    freezePost = async (req:Request,res:Response,next:NextFunction)=>{
        const {postId} = req.params as unknown as {postId:Types.ObjectId};

        const isAdmin = req.user?.role === RoleEnum.admin || req.user?.role === RoleEnum.superAdmin;

        const post = await this.postModel.findById({id:postId});

        if(!post){
            throw new AppError("post not found ",404);
        }

        if (post.freezedAt) {
            throw new AppError("Post already freezed", 400);
        }


        if(!isAdmin && post.createBy.toString() !== req.user?._id.toString()){
            throw new AppError("you are not allowed to freeze this post",403);
        }

        const updatedPost = await this.postModel.findByIdAndUpdate({
            id:postId,
            update:{
                freezedAt:new Date(),
                freezedBy:req.user?._id,
            },
            options:{new:true}
        })

        if(!updatedPost){
            throw new AppError("fail to freeze post",400);
        }

        await this.commentModel.updateMany({
            filter:{postId:post._id,freezedAt:{$exists:false}},
            update:[{$set:{freezedAt:new Date(),freezedBy:req.user?._id}}]
        })

        return res.status(200).json({message:"post freezed successfully"});
    }



    getPostById = async (req:Request,res:Response,next:NextFunction)=>{
        const {postId} = req.params as unknown as {postId:Types.ObjectId};


        const isAdmin = req.user?.role === RoleEnum.admin || req.user?.role === RoleEnum.superAdmin;

        if(!isAdmin){
            const post = await this.postModel.findOne({
                filter:{_id:postId,createBy:req.user?._id},
                options:{populate:[{path:"createBy",select:"userName email profileImage firstName lastName  gender"}]}
            })
            if(!post){
                throw new AppError("post not found",404);
            }
            return res.status(200).json({message:"Done",success:true,data:post});
        }

        const post = await this.postModel.findOne({
            filter:{_id:postId},
            options:{populate:[{path:"createBy",select:"userName email profileImage firstName lastName  gender"}]}
        })


        return res.status(200).json({message:"Done",success:true,data:post});


    }






}

export const postService = new PostService();