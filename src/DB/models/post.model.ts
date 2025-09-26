import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export enum allowCommentEnum{
    alow = "allow",
    diny = "diny",
}

export enum availapilityEnum{
    public = "public",
    friends = "friends",
    private = "private",
}

export enum reactionEnum{
    like ,
    love ,
    care ,
    haha ,
    wow ,
    sad  ,
    angry ,
}


export interface IReaction {
    reaction:reactionEnum;
    userId:Types.ObjectId;
}

export interface IPost {

    description?:string;

    attechment?:string;

    assetsFolder?:string;
    

    tags?:Types.ObjectId[];

    createBy:Types.ObjectId;

    allowComment?:allowCommentEnum;

    availapility?:availapilityEnum;

    freezedBy?:Types.ObjectId;
    freezedAt?:Date;

    restoreBy?:Types.ObjectId;
    restoreAt?:Date;


    createAt:Date;
    updateAt?:Date;

    likes?:IReaction[];
    comments?:Types.ObjectId[];
}



const reactionSchema = new Schema<IReaction>({
    reaction:{type:Number,enum:reactionEnum,default:reactionEnum.like},
    userId:{type:Schema.Types.ObjectId,ref:"User",required:true},
    
},{timestamps:true});


const postSchema = new Schema<IPost>({
    description:{type:String,minLength:5,maxLength:20000,required:function () {
        return !this.attechment?.length 
    }},

    attechment:{
    type:[String]
    } ,

    assetsFolder:{type:String},

    tags:[{type:Schema.Types.ObjectId,ref:"User"}],

    likes:[reactionSchema],

    createBy:{type:Schema.Types.ObjectId,ref:"User",required:true},

    allowComment:{type:String,enum:allowCommentEnum,default:allowCommentEnum.alow},

    availapility:{type:String,enum:availapilityEnum,default:availapilityEnum.public},

    freezedBy:{type:Schema.Types.ObjectId,ref:"User"},

    freezedAt:{type:Date},

    restoreBy:{type:Schema.Types.ObjectId,ref:"User"},

    restoreAt:{type:Date},
},{timestamps:true});


export type HPostDocument = HydratedDocument<IPost>


export const PostModel =  models.Post || model<IPost>("Post",postSchema);