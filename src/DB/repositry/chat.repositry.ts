import { DatabaseRepositry } from "./database.repositry";
import { IChat as TDocument } from "../../DB/models/chat.model";
import { Model } from "mongoose";



export class ChatRepositry extends DatabaseRepositry<TDocument>{
    constructor(protected override readonly model:Model<TDocument>){
        super(model);
    }
}
