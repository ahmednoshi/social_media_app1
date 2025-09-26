import { DatabaseRepositry } from "./database.repositry";
import { IToken as TDocument } from "../../DB/models/token.model";
import { Model } from "mongoose";


export class tokenRepositry extends DatabaseRepositry<TDocument>{
    constructor(protected override readonly model:Model<TDocument>){
        super(model);
    }
}

