import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IMessage{
    content: string;
    createBy: Types.ObjectId;

    createAt?: Date;
    updateAt?: Date;
}
export type HMessageDocument = HydratedDocument<IMessage>;
export interface IChat{
    participants:Types.ObjectId[];
    createBy:Types.ObjectId;

    messages:IMessage[];

    group?:String;
    groupImage?:String;
    roomId?:String;


    createAt?: Date;
    updateAt?: Date;

}

export type HChatDocument = HydratedDocument<IChat>;

const messageSechma = new Schema<IMessage>({
    content:{type:String,minlength:1,maxlength:1000,required:true},
    createBy:{ type:Schema.Types.ObjectId,ref:"User",required:true},

},{timestamps:true});


const chatSechma = new Schema<IChat>({
    participants:[{type:Schema.Types.ObjectId,ref:"User",required:true}],  
    createBy:{ type:Schema.Types.ObjectId,ref:"User",required:true},
    group:{type:String},
    groupImage:{type:String},
    roomId:{type:String,required:function(){
        return this.roomId

    }},
    messages:[messageSechma],

    


},{timestamps:true});


export const ChatModel = models.Chat || model<IChat>("Chat",chatSechma);