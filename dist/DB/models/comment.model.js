"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = exports.commentSchema = void 0;
const mongoose_1 = require("mongoose");
exports.commentSchema = new mongoose_1.Schema({
    description: { type: String },
    attechment: { type: [
            String
        ] },
    createBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Post", required: true },
    commentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" },
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    freezedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    freezedAt: { type: Date },
    restoreBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    restoreAt: { type: Date },
    createAt: Date,
    updateAt: { type: Date },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
exports.commentSchema.virtual("replay", {
    ref: "Comment",
    localField: "_id",
    foreignField: "commentId"
});
exports.commentSchema.pre("deleteOne", async function (next) {
    const filter = this.getFilter();
    const replay = await this.model.find({ commentId: filter._id });
    if (replay.length) {
        for (const rep of replay) {
            await this.model.deleteMany({ _id: rep._id });
        }
    }
    next();
});
exports.CommentModel = mongoose_1.models.Comment || (0, mongoose_1.model)("Comment", exports.commentSchema);
