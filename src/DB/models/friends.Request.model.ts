import { HydratedDocument, model, models, Schema, Types } from "mongoose"



export enum statusEnum{
    pending = "pending",
    accepted = "accepted",
    rejected = "rejected",
}


export interface IFriendsRequest{
    senderTo:Types.ObjectId
    createBy:Types.ObjectId
    accepted?:Date
    createAt:Date
    updateAt?:Date
    status?:statusEnum
}


export const friendsRequestSchema = new Schema<IFriendsRequest>({
    senderTo:{type:Schema.Types.ObjectId,ref:"User",required:true},
    createBy:{type:Schema.Types.ObjectId,ref:"User",required:true},
    accepted:{type:Date},
    createAt:Date,
    updateAt:{type:Date},
    status:{type:String,enum:statusEnum , default:statusEnum.pending}
},{timestamps:true});


export type HfriendsRequestDocument = HydratedDocument<IFriendsRequest>

export const friendsRequestModel =  models.Comment || model<IFriendsRequest>("FriendsRequest",friendsRequestSchema);
