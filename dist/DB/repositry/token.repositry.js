"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRepositry = void 0;
const database_repositry_1 = require("./database.repositry");
class tokenRepositry extends database_repositry_1.DatabaseRepositry {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.tokenRepositry = tokenRepositry;
