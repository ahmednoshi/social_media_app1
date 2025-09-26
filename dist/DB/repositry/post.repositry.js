"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepositry = void 0;
const database_repositry_1 = require("./database.repositry");
class PostRepositry extends database_repositry_1.DatabaseRepositry {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.PostRepositry = PostRepositry;
