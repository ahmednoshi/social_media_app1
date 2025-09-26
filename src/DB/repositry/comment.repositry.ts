import { DatabaseRepositry } from "./database.repositry";
import { IComment as TDocument } from "../../DB/models/comment.model";
import { Model } from "mongoose";



export class CommentRepositry extends DatabaseRepositry<TDocument>{
    constructor(protected override readonly model:Model<TDocument>){
        super(model);
    }
}
