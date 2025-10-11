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
    freezeComment = async (req, res, next) => {
        const { commentId } = req.params;
        const isAdmin = req.user?.role === user_model_1.RoleEnum.admin || req.user?.role === user_model_1.RoleEnum.superAdmin;
        const comment = await this.commentModel.findById({
            id: commentId
        });
        if (!comment) {
            throw new app_Error_1.AppError("comment not found", 404);
        }
        if (!isAdmin && comment.createBy.toString() !== req.user?._id.toString()) {
            throw new app_Error_1.AppError("you are not allowed to freeze this comment", 403);
        }
        if (comment.freezedAt) {
            throw new app_Error_1.AppError("Comment already freezed", 400);
        }
        await this.commentModel.updateOne({
            filter: { _id: commentId },
            update: { freezedBy: req.user?._id, freezedAt: new Date() },
        });
        return res.status(200).json({ message: "comment freezed successfully", success: true });
    };
    updateComment = async (req, res, next) => {
        const { commentId } = req.params;
        const comment = await this.commentModel.findOne({
            filter: { _id: commentId, createBy: req.user?._id, freezedAt: { $exists: false } }
        });
        if (!comment) {
            throw new app_Error_1.AppError("comment not found or you are not allowed to update it", 404);
        }
        if (req.body.tags?.length && (await this.userModel.find({ filter: { _id: { $in: req.body.tags, $ne: req.user?._id } } })).length === req.body.tags?.length) {
            throw new app_Error_1.AppError("invalid tags", 400);
        }
        await this.commentModel.updateOne({
            filter: { _id: commentId },
            update: { ...req.body, updateAt: new Date() },
        });
        return res.status(201).json({ message: "comment updated successfully", success: true });
    };
    getCommentsById = async (req, res, next) => {
        const { commentId } = req.params;
        const isAdmin = req.user?.role === user_model_1.RoleEnum.admin || req.user?.role === user_model_1.RoleEnum.superAdmin;
        if (!isAdmin) {
            const comment = await this.commentModel.findOne({
                filter: { _id: commentId, createBy: req.user?._id, freezedAt: { $exists: false } },
                options: { populate: { path: "postId", select: "_id createBy availapility", match: { availapility: post_model_1.availapilityEnum.public } } }
            });
            if (!comment || !comment.postId?._id) {
                throw new app_Error_1.AppError("comment not found", 404);
            }
        }
        const comment = await this.commentModel.findOne({
            filter: { _id: commentId },
            options: { populate: [{ path: "postId", select: "_id createBy availapility", match: { availapility: post_model_1.availapilityEnum.public } }, { path: "createBy", select: "_id userName profileImage" }] }
        });
        if (!comment) {
            throw new app_Error_1.AppError("comment not found", 404);
        }
        return res.status(200).json({ message: "comment found successfully", success: true, comment });
    };
}
exports.default = new CommentService;
