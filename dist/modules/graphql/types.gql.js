"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentType = exports.postType = void 0;
const graphql_1 = require("graphql");
const post_model_1 = require("../../DB/models/post.model");
exports.postType = new graphql_1.GraphQLObjectType({
    name: "Post",
    fields: () => ({
        _id: { type: graphql_1.GraphQLID },
        description: { type: graphql_1.GraphQLString },
        tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        createBy: { type: graphql_1.GraphQLID },
        availapility: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLEnumType({
                name: "availability",
                values: {
                    public: { value: post_model_1.availapilityEnum.public },
                    private: { value: post_model_1.availapilityEnum.private },
                    friends: { value: post_model_1.availapilityEnum.friends }
                }
            })) },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        likes: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        allowComment: {
            type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLEnumType({
                name: "allowComment",
                values: {
                    alow: { value: post_model_1.allowCommentEnum.alow },
                    diny: { value: post_model_1.allowCommentEnum.diny }
                }
            }))
        },
        attechment: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        assetsFolder: { type: graphql_1.GraphQLString },
    }),
});
exports.commentType = new graphql_1.GraphQLObjectType({
    name: "Comment",
    fields: () => ({
        _id: { type: graphql_1.GraphQLID },
        description: { type: graphql_1.GraphQLString },
        attachment: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        createBy: { type: graphql_1.GraphQLID },
        postId: { type: graphql_1.GraphQLID },
        commentId: { type: graphql_1.GraphQLID },
        tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        freezedBy: { type: graphql_1.GraphQLID },
        freezedAt: { type: graphql_1.GraphQLString },
        restoreBy: { type: graphql_1.GraphQLID },
        restoreAt: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        likes: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        post: { type: exports.postType, resolve: async (parent) => {
                return await post_model_1.PostModel.findById(parent.postId);
            } },
    })
});
