"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepositry = void 0;
const database_repositry_1 = require("./database.repositry");
class CommentRepositry extends database_repositry_1.DatabaseRepositry {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.CommentRepositry = CommentRepositry;
