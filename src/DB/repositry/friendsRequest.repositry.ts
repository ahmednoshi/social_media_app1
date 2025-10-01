import { DatabaseRepositry } from "./database.repositry";
import { IFriendsRequest as TDocument } from "../../DB/models/friends.Request.model";
import { Model } from "mongoose";



export class friendsRequestRepositry extends DatabaseRepositry<TDocument>{
    constructor(protected override readonly model:Model<TDocument>){
        super(model);
    }
}
