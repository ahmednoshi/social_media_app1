"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModel = void 0;
const mongoose_1 = require("mongoose");
const messageSechma = new mongoose_1.Schema({
    content: { type: String, minlength: 1, maxlength: 1000, required: true },
    createBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
const chatSechma = new mongoose_1.Schema({
    participants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }],
    createBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    group: { type: String },
    groupImage: { type: String },
    roomId: { type: String, required: function () {
            return this.roomId;
        } },
    messages: [messageSechma],
}, { timestamps: true });
exports.ChatModel = mongoose_1.models.Chat || (0, mongoose_1.model)("Chat", chatSechma);
