"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const post_model_1 = require("../../DB/models/post.model");
const post_repositry_1 = require("../../DB/repositry/post.repositry");
const types_gql_1 = require("../graphql/types.gql");
class PostFileds {
    postModel = new post_repositry_1.PostRepositry(post_model_1.PostModel);
    constructor() { }
    query = () => {
        return {
            getPost: {
                type: types_gql_1.postType,
                args: {
                    _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) }
                },
                resolve: async (_, args) => {
                    console.log(args._id);
                    return await this.postModel.findById({ id: args._id });
                }
            },
            getAllPost: {
                type: new graphql_1.GraphQLList(types_gql_1.postType),
                args: {},
                resolve: async (_, args) => {
                    const posts = await this.postModel.find({
                        filter: {},
                    });
                    return posts;
                }
            },
        };
    };
}
exports.default = new PostFileds();
