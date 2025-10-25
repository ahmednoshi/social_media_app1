"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaApp = void 0;
const graphql_1 = require("graphql");
const post_gql_fileds_1 = __importDefault(require("../post/post.gql.fileds"));
const comment_gql_fileds_1 = __importDefault(require("../comment/comment.gql.fileds"));
exports.schemaApp = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: "Query",
        fields: () => ({
            ...post_gql_fileds_1.default.query(),
            ...comment_gql_fileds_1.default.query(),
        }),
    }),
});
