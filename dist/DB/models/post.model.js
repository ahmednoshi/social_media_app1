"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = exports.reactionEnum = exports.availapilityEnum = exports.allowCommentEnum = void 0;
const mongoose_1 = require("mongoose");
var allowCommentEnum;
(function (allowCommentEnum) {
    allowCommentEnum["alow"] = "allow";
    allowCommentEnum["diny"] = "diny";
})(allowCommentEnum || (exports.allowCommentEnum = allowCommentEnum = {}));
var availapilityEnum;
(function (availapilityEnum) {
    availapilityEnum["public"] = "public";
    availapilityEnum["friends"] = "friends";
    availapilityEnum["private"] = "private";
})(availapilityEnum || (exports.availapilityEnum = availapilityEnum = {}));
var reactionEnum;
(function (reactionEnum) {
    reactionEnum[reactionEnum["like"] = 0] = "like";
    reactionEnum[reactionEnum["love"] = 1] = "love";
    reactionEnum[reactionEnum["care"] = 2] = "care";
    reactionEnum[reactionEnum["haha"] = 3] = "haha";
    reactionEnum[reactionEnum["wow"] = 4] = "wow";
    reactionEnum[reactionEnum["sad"] = 5] = "sad";
    reactionEnum[reactionEnum["angry"] = 6] = "angry";
})(reactionEnum || (exports.reactionEnum = reactionEnum = {}));
const reactionSchema = new mongoose_1.Schema({
    reaction: { type: Number, enum: reactionEnum, default: reactionEnum.like },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
const postSchema = new mongoose_1.Schema({
    description: { type: String, minLength: 5, maxLength: 20000, required: function () {
            return !this.attechment?.length;
        } },
    attechment: {
        type: [String]
    },
    assetsFolder: { type: String },
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    likes: [reactionSchema],
    createBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    allowComment: { type: String, enum: allowCommentEnum, default: allowCommentEnum.alow },
    availapility: { type: String, enum: availapilityEnum, default: availapilityEnum.public },
    freezedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    freezedAt: { type: Date },
    restoreBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    restoreAt: { type: Date },
}, { timestamps: true });
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)("Post", postSchema);
