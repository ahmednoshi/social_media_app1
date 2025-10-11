"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_service_1 = require("./post.service");
const authentication_middleware_1 = require("../../middleware/authentication.middleware");
const cloud_multer_1 = require("../../utils/multer/cloud.multer");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const validators = __importStar(require("./post.validation"));
const comment_controller_1 = __importDefault(require("../comment/comment.controller"));
const postRouter = (0, express_1.Router)();
postRouter.use("/:postId/comment", comment_controller_1.default);
postRouter.post("/createPost", (0, authentication_middleware_1.authentication)(), (0, cloud_multer_1.cloudFileUpload)({ Validation: cloud_multer_1.fileValidation.image }).array("attechment"), (0, validation_middleware_1.validation)(validators.createPost), post_service_1.postService.createPost);
postRouter.patch("/:postId", (0, authentication_middleware_1.authentication)(), post_service_1.postService.likesPost);
postRouter.patch("/disLike/:postId", (0, authentication_middleware_1.authentication)(), post_service_1.postService.disLike);
postRouter.patch("/updatePost/:postId/", (0, authentication_middleware_1.authentication)(), (0, cloud_multer_1.cloudFileUpload)({ Validation: cloud_multer_1.fileValidation.image }).array("attechment"), post_service_1.postService.updatePost);
postRouter.get("/", (0, authentication_middleware_1.authentication)(), post_service_1.postService.getPost);
postRouter.delete("/:postId", (0, authentication_middleware_1.authentication)(), post_service_1.postService.deletePost);
postRouter.post("/freeze/:postId", (0, authentication_middleware_1.authentication)(), post_service_1.postService.freezePost);
postRouter.post("/getPostById/:postId", (0, authentication_middleware_1.authentication)(), post_service_1.postService.getPostById);
exports.default = postRouter;
