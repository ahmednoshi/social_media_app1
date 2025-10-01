"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendsRequestRepositry = void 0;
const database_repositry_1 = require("./database.repositry");
class friendsRequestRepositry extends database_repositry_1.DatabaseRepositry {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.friendsRequestRepositry = friendsRequestRepositry;
