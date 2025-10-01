import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { IPost } from "./post.model";


export interface IComment {
    description?:string,
    attechment?:string,
    createBy:Types.ObjectId,
    postId:Types.ObjectId | Partial<IPost>,
    commentId?:Types.ObjectId,
    tags?:Types.ObjectId[],
    freezedBy?:Types.ObjectId;
    freezedAt?:Date;
    restoreBy?:Types.ObjectId;
    restoreAt?:Date;
    createAt:Date;
    updateAt?:Date;
    likes?:Types.ObjectId[];
}

export const commentSchema = new Schema<IComment>({
    description:{type:String},
    attechment:{type:[
        String
    ]},
    createBy:{type:Schema.Types.ObjectId,ref:"User",required:true},
    postId:{type:Schema.Types.ObjectId,ref:"Post",required:true},
    commentId:{type:Schema.Types.ObjectId,ref:"Comment"},
    tags:[{type:Schema.Types.ObjectId,ref:"User"}],
    freezedBy:{type:Schema.Types.ObjectId,ref:"User"},
    freezedAt:{type:Date},
    restoreBy:{type:Schema.Types.ObjectId,ref:"User"},
    restoreAt:{type:Date},
    createAt:Date,
    updateAt:{type:Date},
    likes:[{type:Schema.Types.ObjectId,ref:"User"}],
},{timestamps:true , toJSON:{virtuals:true},toObject:{virtuals:true}});


commentSchema.virtual("replay",{
    ref:"Comment",
    localField:"_id",
    foreignField:"commentId"
})

commentSchema.pre("deleteOne",async function(next){
    const filter = this.getFilter();
    const replay = await this.model.find({commentId:filter._id});

    if(replay.length){
        for(const rep of replay){
           await this.model.deleteMany({_id:rep._id});
        }   
    }

    next();
})




export type HPostDocument = HydratedDocument<IComment>

export const CommentModel =  models.Comment || model<IComment>("Comment",commentSchema);

