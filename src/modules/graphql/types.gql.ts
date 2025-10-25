import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLEnumType,
  GraphQLNonNull,
} from "graphql";
import { allowCommentEnum, availapilityEnum, PostModel } from "../../DB/models/post.model";




export const postType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    _id: { type: GraphQLID },
    description: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) },
    createBy: { type: GraphQLID },
    availapility: {   type: new GraphQLNonNull(new GraphQLEnumType({
            name: "availability",
            values: {
                public: { value:availapilityEnum.public  },
                private: { value: availapilityEnum.private },
                friends: { value: availapilityEnum.friends }
            }

        })) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    likes: { type: new GraphQLList(GraphQLID) },
    allowComment: {
        type: new GraphQLNonNull(new GraphQLEnumType({
            name: "allowComment",
            values: {
                alow: { value:allowCommentEnum.alow  },
                diny: { value: allowCommentEnum.diny }
            }

        }))

    },
    attechment: { type: new GraphQLList(GraphQLString) },
    assetsFolder: { type: GraphQLString },
    



  }),
});



export const commentType = new GraphQLObjectType({
    name: "Comment",
    fields: () => ({
    _id: { type: GraphQLID },
    description: { type: GraphQLString },
    attachment: { type: new GraphQLList(GraphQLString) },
    createBy: { type: GraphQLID }, // ref لـ User
    postId: { type: GraphQLID },   // ref لـ Post
    commentId: { type: GraphQLID }, // ref لـ Comment (لو reply)
    tags: { type: new GraphQLList(GraphQLID) }, // ref لـ Users
    freezedBy: { type: GraphQLID },
    freezedAt: { type: GraphQLString }, // التاريخ بيتحول String في GraphQL
    restoreBy: { type: GraphQLID },
    restoreAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    likes: { type: new GraphQLList(GraphQLID) }, // ref لـ Users
    post:{type:postType,resolve:async(parent)=>{
        return await (PostModel as any).findById(parent.postId)
    }},
    
    })
})