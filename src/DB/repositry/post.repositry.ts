import { DatabaseRepositry } from "./database.repositry";
import { IPost as TDocument } from "../../DB/models/post.model";
import { Model } from "mongoose";



export class PostRepositry extends DatabaseRepositry<TDocument>{
    constructor(protected override readonly model:Model<TDocument>){
        super(model);
    }
}
