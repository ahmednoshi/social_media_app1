"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comment_model_1 = require("../../DB/models/comment.model");
const post_model_1 = require("../../DB/models/post.model");
const user_model_1 = require("../../DB/models/user.model");
const comment_repositry_1 = require("../../DB/repositry/comment.repositry");
const database_repositry_1 = require("../../DB/repositry/database.repositry");
const post_repositry_1 = require("../../DB/repositry/post.repositry");
const app_Error_1 = require("../../utils/response/app.Error");
const s3_config_1 = require("../../utils/aws/s3.config");
class CommentService {
    commentModel = new comment_repositry_1.CommentRepositry(comment_model_1.CommentModel);
    postModel = new post_repositry_1.PostRepositry(post_model_1.PostModel);
    userModel = new database_repositry_1.DatabaseRepositry(user_model_1.UserModel);
    constructor() { }
    createComment = async (req, res, next) => {
        const { postId } = req.params;
        const post = await this.postModel.findOne({
            filter: { _id: postId, allowComment: post_model_1.allowCommentEnum.alow },
        });
        if (!post) {
            throw new app_Error_1.AppError("post not found", 404);
        }
        if (req.body.tags?.length && (await this.userModel.find({ filter: { _id: { $in: req.body.tags, $ne: req.user?._id } } })).length === req.body.tags?.length) {
            throw new app_Error_1.AppError("invalid tags", 400);
        }
        let attechment = [];
        console.log("req.files >>>", req.files);
        console.log("attechment >>>", attechment);
        if (req.files?.length) {
            attechment = await (0, s3_config_1.uploadFiles)({ files: req.files, path: `users/${post.createBy}/posts/${post.assetsFolder}` });
        }
        const [comment] = await this.commentModel.create({
            data: [
                {
                    ...req.body,
                    createBy: req.user._id,
                    postId,
                    attechment,
                }
            ]
        }) || [];
        if (!comment) {
            if (attechment.length) {
                await (0, s3_config_1.deleteFiles)({ urls: attechment });
            }
            throw new app_Error_1.AppError("post not found", 404);
        }
        else {
            if (req.body.removeAttechment?.length) {
                await (0, s3_config_1.deleteFiles)({ urls: req.body.removeAttechment || [] });
            }
        }
        console.log("req.file >>>", req.file);
        return res.status(201).json({ message: " comment created successfully", success: true });
    };
    replayComment = async (req, res, next) => {
        const { postId, commentId } = req.params;
        const comment = await this.commentModel.findOne({
            filter: { _id: commentId, postId },
            options: {
                populate: [{ path: "postId", match: { allowComment: post_model_1.allowCommentEnum.alow } }]
            }
        });
        console.log(comment);
        if (!comment?.postId) {
            throw new app_Error_1.AppError("post not found..........", 404);
        }
        if (req.body.tags?.length && (await this.userModel.find({ filter: { _id: { $in: req.body.tags, $ne: req.user?._id } } })).length === req.body.tags?.length) {
            throw new app_Error_1.AppError("invalid tags", 400);
        }
        let attechment = [];
        if (req.files?.length) {
            const post = comment.postId;
            attechment = await (0, s3_config_1.uploadFiles)({ files: req.files, path: `users/${post.createBy}/posts/${post.assetsFolder}` });
        }
        const [replay] = await this.commentModel.create({
            data: [
                {
                    ...req.body,
                    createBy: req.user._id,
                    postId,
                    commentId,
                    attechment,
                }
            ]
        }) || [];
        if (!replay) {
            if (attechment.length) {
                await (0, s3_config_1.deleteFiles)({ urls: attechment });
            }
            throw new app_Error_1.AppError("post not found", 404);
        }
        else {
            if (req.body.removeAttechment?.length) {
                await (0, s3_config_1.deleteFiles)({ urls: req.body.removeAttechment || [] });
            }
        }
        return res.status(201).json({ message: "replay created successfully", success: true });
    };
    deleteComment = async (req, res, next) => {
        const { commentId } = req.params;
        const comment = await this.commentModel.findOne({
            filter: { _id: commentId, createBy: req.user?._id }
        });
        if (!comment) {
            throw new app_Error_1.AppError("comment not found", 404);
        }
        await this.commentModel.deleteOne({ filter: { _id: commentId } });
        return res.status(201).json({ message: "comment deleted successfully", success: true });
    };
}
exports.default = new CommentService;
