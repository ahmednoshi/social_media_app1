"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.PostAvailability = void 0;
const post_model_1 = require("../../DB/models/post.model");
const user_model_1 = require("../../DB/models/user.model");
const database_repositry_1 = require("../../DB/repositry/database.repositry");
const app_Error_1 = require("../../utils/response/app.Error");
const s3_config_1 = require("../../utils/aws/s3.config");
const uuid_1 = require("uuid");
const mongoose_1 = require("mongoose");
const post_repositry_1 = require("./../../DB/repositry/post.repositry");
const comment_repositry_1 = require("../../DB/repositry/comment.repositry");
const comment_model_1 = require("../../DB/models/comment.model");
const email_event_1 = __importDefault(require("../../utils/event/email.event"));
const PostAvailability = (req) => {
    return [
        { availability: post_model_1.availapilityEnum.public },
        { availability: post_model_1.availapilityEnum.private, createBy: req.user?._id },
        { availability: post_model_1.availapilityEnum.friends, createBy: { $in: [...(req.user?.friends || []), req.user?._id] } }
    ];
};
exports.PostAvailability = PostAvailability;
class PostService {
    userModel = new database_repositry_1.DatabaseRepositry(user_model_1.UserModel);
    postModel = new post_repositry_1.PostRepositry(post_model_1.PostModel);
    commentModel = new comment_repositry_1.CommentRepositry(comment_model_1.CommentModel);
    constructor() { }
    createPost = async (req, res, next) => {
        if (req.body.tags?.length && (await this.userModel.find({ filter: { _id: { $in: req.body.tags, $ne: req.user?._id } } })).length === req.body.tags?.length) {
            throw new app_Error_1.AppError("invalid tags", 400);
        }
        let attechment = [];
        let assetsFolder = (0, uuid_1.v4)();
        console.log("req.files >>>", req.files);
        console.log("attechment >>>", attechment);
        if (req.files?.length) {
            attechment = await (0, s3_config_1.uploadFiles)({ files: req.files, path: `users/${req.user._id}/posts/` });
        }
        const [post] = await this.postModel.create({
            data: [
                {
                    ...req.body,
                    assetsFolder,
                    createBy: req.user._id,
                    attechment,
                }
            ]
        }) || [];
        if (post?.tags?.length) {
            const taggedUsers = await this.userModel.find({
                filter: { _id: { $in: post.tags } }
            });
            taggedUsers.forEach(user => {
                email_event_1.default.emit("some one mentioned you", {
                    to: user.email,
                    mentionedBy: req.user?.username || "Someone",
                    postContent: post.description,
                    postLink: `http://localhost:3000/posts/${post._id}`
                });
            });
        }
        if (!post) {
            throw new app_Error_1.AppError("fail to create post", 400);
        }
        console.log("req.file >>>", req.file);
        return res.status(201).json({ message: "post created successfully" });
    };
    likesPost = async (req, res, next) => {
        const { postId } = req.params;
        const userId = req.user?._id;
        const { reaction } = req.body;
        if (!reaction) {
            await this.postModel.updateOne({
                filter: { _id: postId },
                update: {
                    $pull: { likes: { userId } }
                }
            });
            return res.status(200).json({ message: "post unliked successfully" });
        }
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
            },
        });
        if (!post) {
            throw new app_Error_1.AppError("post not found", 404);
        }
        let postExist = post.likes.findIndex((reaction) => {
            return reaction.userId.toString() == userId.toString();
        });
        if (postExist == -1)
            await this.postModel.updateOne({
                filter: { _id: postId },
                update: {
                    $push: { likes: {
                            reaction,
                            userId
                        } }
                }
            });
        else {
            await this.postModel.updateOne({
                filter: { _id: postId, "likes.userId": userId },
                update: {
                    $set: { "likes.$.reaction": reaction }
                },
            });
        }
        return res.status(200).json({ message: "post liked successfully" });
    };
    disLike = async (req, res, next) => {
        const { postId } = req.params;
        const post = await this.postModel.findOneAndUpdate({
            filter: { _id: postId
            },
            update: { $pull: { likes: req.user._id } },
        });
        if (!post) {
            throw new app_Error_1.AppError("post not found", 404);
        }
        return res.status(200).json({ message: "post disliked successfully" });
    };
    updatePost = async (req, res, next) => {
        const { postId } = req.params;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createBy: req.user._id
            }
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
            attechment = await (0, s3_config_1.uploadFiles)({ files: req.files, path: `users/${post.createBy._id}/posts/${post.assetsFolder}` });
        }
        const update = await this.postModel.updateOne({
            filter: { _id: post._id },
            update: [
                {
                    $set: {
                        description: req.body.description,
                        allowComment: req.body.allowComment || post.allowComment,
                        availapility: req.body.availapility || post.availapility,
                        attechment: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$attechment",
                                        req.body.removeAttechment || [],
                                    ],
                                },
                                attechment,
                            ]
                        },
                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$tags",
                                        (req.body.removedTags || []).map((tag) => {
                                            return mongoose_1.Types.ObjectId.createFromHexString(tag);
                                        }),
                                    ],
                                },
                                (req.body.tags || []).map((tag) => {
                                    return mongoose_1.Types.ObjectId.createFromHexString(tag);
                                }),
                            ]
                        }
                    }
                }
            ]
        });
        if (!update.matchedCount) {
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
        return res.status(201).json({ message: "post updated successfully" });
    };
    getPost = async (req, res, next) => {
        let { page, size } = req.query;
        const post = await this.postModel.paginate({
            filter: {
                createBy: req.user._id
            },
            options: {
                populate: [{ path: "comments", match: { commentId: { $exists: false }, freezedAt: { $exists: false } },
                        populate: [{ path: "replay", match: { commentId: { $exists: false }, freezedAt: { $exists: false } } }]
                    }]
            },
            page,
            size,
        });
        return res.status(200).json({
            message: "Done",
            success: true,
            data: post
        });
    };
    deletePost = async (req, res, next) => {
        const { postId } = req.params;
        const post = await this.postModel.findOne({
            filter: { _id: postId, createBy: req.user?._id }
        });
        if (!post) {
            throw new app_Error_1.AppError("post not found", 404);
        }
        await this.postModel.deleteOne({ filter: { _id: postId } });
        return res.status(200).json({ message: "post deleted successfully" });
    };
    freezePost = async (req, res, next) => {
        const { postId } = req.params;
        const isAdmin = req.user?.role === user_model_1.RoleEnum.admin || req.user?.role === user_model_1.RoleEnum.superAdmin;
        const post = await this.postModel.findById({ id: postId });
        if (!post) {
            throw new app_Error_1.AppError("post not found ", 404);
        }
        if (post.freezedAt) {
            throw new app_Error_1.AppError("Post already freezed", 400);
        }
        if (!isAdmin && post.createBy.toString() !== req.user?._id.toString()) {
            throw new app_Error_1.AppError("you are not allowed to freeze this post", 403);
        }
        const updatedPost = await this.postModel.findByIdAndUpdate({
            id: postId,
            update: {
                freezedAt: new Date(),
                freezedBy: req.user?._id,
            },
            options: { new: true }
        });
        if (!updatedPost) {
            throw new app_Error_1.AppError("fail to freeze post", 400);
        }
        await this.commentModel.updateMany({
            filter: { postId: post._id, freezedAt: { $exists: false } },
            update: [{ $set: { freezedAt: new Date(), freezedBy: req.user?._id } }]
        });
        return res.status(200).json({ message: "post freezed successfully" });
    };
    getPostById = async (req, res, next) => {
        const { postId } = req.params;
        const isAdmin = req.user?.role === user_model_1.RoleEnum.admin || req.user?.role === user_model_1.RoleEnum.superAdmin;
        if (!isAdmin) {
            const post = await this.postModel.findOne({
                filter: { _id: postId, createBy: req.user?._id },
                options: { populate: [{ path: "createBy", select: "userName email profileImage firstName lastName  gender" }] }
            });
            if (!post) {
                throw new app_Error_1.AppError("post not found", 404);
            }
            return res.status(200).json({ message: "Done", success: true, data: post });
        }
        const post = await this.postModel.findOne({
            filter: { _id: postId },
            options: { populate: [{ path: "createBy", select: "userName email profileImage firstName lastName  gender" }] }
        });
        return res.status(200).json({ message: "Done", success: true, data: post });
    };
}
exports.postService = new PostService();
