
import { CreateOptions, HydratedDocument,ProjectionType, Model,  QueryOptions, RootFilterQuery, FlattenMaps, UpdateQuery, MongooseUpdateQueryOptions, UpdateWriteOpResult, Types, DeleteResult, UpdateResult } from 'mongoose';



export class DatabaseRepositry<TDocument>{

    
    constructor(protected readonly model:Model<TDocument>){}


    

    async create(
        {
            data,
            options,
        }:{
            data:Partial<TDocument>[],
            options?:CreateOptions
        }
    ):Promise<HydratedDocument<TDocument>[] | undefined> {
        return await  this.model.create(data,options);
}


    async findOne({
    filter,
    select,
    options

}:{
    filter?: RootFilterQuery<TDocument>,
    select?: ProjectionType<TDocument> | null,
    options?: QueryOptions<TDocument> | null,

}):Promise<HydratedDocument<FlattenMaps<TDocument>>|HydratedDocument<TDocument> | null> {

    const doc = this.model.findOne(filter).select(select || " ");
    if(options?.lean){
        doc.lean(options.lean);
    }

    if (options?.populate) {
    doc.populate(options.populate as any); 
    }


    return await doc.exec();

}



    async updateOne({
    filter,
    update,
    options
}:{
    
       filter:RootFilterQuery<TDocument>,
          update: UpdateQuery<TDocument> ,
          options?:  MongooseUpdateQueryOptions<TDocument>| null
}):Promise<UpdateWriteOpResult>{
    if(Array.isArray(update)){
        update.push({
            $set:{
                __v:{$add:["$__v",1]}
            }
        });
        return await this.model.updateMany(filter || {},update, options);
        
    }
    
    return await this.model.updateOne(
        filter || {},{...update,$inc:{__v:1}}, options);
}


async updateMany({
    filter,
    update,
    options
}:{
    filter: RootFilterQuery<TDocument>,
    update: UpdateQuery<TDocument> ,
    options?: MongooseUpdateQueryOptions<TDocument> | null
}):Promise<UpdateResult>{

    if (!filter || Object.keys(filter).length === 0) {
    throw new Error("Filter is required to prevent mass update.");
        }

    return await this.model.updateMany(filter,update, options)

}


async find(
    {
    filter,projection,options
}:{
     filter: RootFilterQuery<TDocument>,
      projection?: ProjectionType<TDocument> | null | undefined,
      options?:QueryOptions<TDocument> | null | undefined,
}):Promise<HydratedDocument<FlattenMaps<TDocument>>[]> {
    return await this.model.find( filter , projection , options );
}


async findById({
    id,
    projection,
    options
}:{
     id: any,
      projection?: ProjectionType<TDocument> | null,
      options?: QueryOptions<TDocument> | null
}):Promise<HydratedDocument<FlattenMaps<TDocument>>|HydratedDocument<TDocument> | null > {
    const doc = this.model.findById(id,projection,options);
    if(options?.lean){
        doc.lean(options.lean);
    }
    return await doc.exec();

}



async findByIdAndUpdate({
    id,
    update,
    options
}:{
    id: Types.ObjectId 
    update?:UpdateQuery<TDocument>,
    options?: QueryOptions<TDocument> | null
}):Promise<HydratedDocument<FlattenMaps<TDocument>>|HydratedDocument<TDocument> | null > {
    return await this.model.findByIdAndUpdate(id,update,options);
}


async findOneAndUpdate({
    filter,
    update,
    options
}:{
      filter?: RootFilterQuery<TDocument>,
      update?: UpdateQuery<TDocument>,
      options?: QueryOptions<TDocument> | null
}):Promise<HydratedDocument<FlattenMaps<TDocument>>|HydratedDocument<TDocument> | null > {
    return await this.model.findOneAndUpdate(filter,update,options);
}



async deleteOne({filter}:{
    filter: RootFilterQuery<TDocument>,
}):Promise<DeleteResult>{
    return await this.model.deleteOne(filter);
}


async deleteMany({filter}:{
    filter: RootFilterQuery<TDocument>,
}):Promise<DeleteResult>{
    return await this.model.deleteMany(filter);
}





async paginate(
    {
    filter,projection={},options={},page=1,size=5
}:{
     filter: RootFilterQuery<TDocument>,
      projection?: ProjectionType<TDocument>  | undefined,
      options?:QueryOptions<TDocument> | undefined,
      page?:number,
      size?:number
}):Promise<HydratedDocument<FlattenMaps<TDocument>>[] | any> {
    page = Math.floor(page<1 ? 1 : page);
    options.limit = Math.floor(size<1 || !size?5:size);
    options.skip =(page - 1)* options.limit;    
    const result = await this.find( {filter , projection , options} );
    return result
}



































}






