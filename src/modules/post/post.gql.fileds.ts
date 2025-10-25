import { GraphQLID, GraphQLList, GraphQLNonNull } from "graphql"
import { PostModel } from "../../DB/models/post.model"
import { PostRepositry } from "../../DB/repositry/post.repositry"
import { postType } from "../graphql/types.gql";


class PostFileds {
    private postModel = new PostRepositry(PostModel);
    constructor(){}
    query = ()=>{
        return{
            getPost:{
                type:postType,
                args:{
                    _id:{type:new GraphQLNonNull(GraphQLID)}
                },
                resolve:async (_:any,args:any)=>{
                    console.log(args._id);
                return await this.postModel.findById( { id: args._id });
                }
            },

            getAllPost:{
                type: new GraphQLList(postType),
                args:{},
                resolve:async (_:any,args:any)=>{
                    const posts = await this.postModel.find({
                        filter:{},
                    });
                    return posts
                   
                }
            },


            


        }
    }
}


export default new PostFileds()