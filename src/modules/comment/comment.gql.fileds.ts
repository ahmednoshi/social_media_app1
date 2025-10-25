import { GraphQLList } from "graphql";
import { CommentModel } from "../../DB/models/comment.model";
import { CommentRepositry } from "../../DB/repositry/comment.repositry";
import { commentType } from "../graphql/types.gql";

class commentFileds{
    private commentModel = new CommentRepositry(CommentModel)
    constructor(){}

    query=()=>{
        return{
            getAllComments:{
                type: new GraphQLList(commentType),
                args:{},
                resolve:async (_:any,args:any)=>{
                    const comments = await this.commentModel.find({
                        filter:{},
                    });
                    return comments
                }
            }
        }
    }
   

}

export default new commentFileds