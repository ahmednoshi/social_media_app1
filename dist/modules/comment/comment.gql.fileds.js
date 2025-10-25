"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const comment_model_1 = require("../../DB/models/comment.model");
const comment_repositry_1 = require("../../DB/repositry/comment.repositry");
const types_gql_1 = require("../graphql/types.gql");
class commentFileds {
    commentModel = new comment_repositry_1.CommentRepositry(comment_model_1.CommentModel);
    constructor() { }
    query = () => {
        return {
            getAllComments: {
                type: new graphql_1.GraphQLList(types_gql_1.commentType),
                args: {},
                resolve: async (_, args) => {
                    const comments = await this.commentModel.find({
                        filter: {},
                    });
                    return comments;
                }
            }
        };
    };
}
exports.default = new commentFileds;
