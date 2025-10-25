import { GraphQLObjectType, GraphQLSchema } from "graphql";
import PostFileds from "../post/post.gql.fileds";
import commentFileds from "../comment/comment.gql.fileds"

export const schemaApp = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "Query",
        fields: () => ({
            ...PostFileds.query(),
            ...commentFileds.query(),
        }),
        
        
    }) ,
    // mutation: new GraphQLObjectType({
    //     name: "Mutation",
    //     fields: () => ({}),
    // }) ,
});