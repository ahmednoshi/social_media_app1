"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_model_1 = require("./models/user.model");
const connectionDB = async () => {
    try {
        const result = await (0, mongoose_1.connect)(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
        });
        await user_model_1.UserModel.syncIndexes();
        console.log(result.models);
        console.log("Database connected successfully ❤️  ❤️");
    }
    catch (error) {
        console.log("Database connection error", error);
    }
};
exports.default = connectionDB;
