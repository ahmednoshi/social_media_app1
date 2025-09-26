"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = require("../../middleware/authentication.middleware");
const cloud_multer_1 = require("../../utils/multer/cloud.multer");
const comment_service_1 = __importDefault(require("./comment.service"));
const commentRouter = (0, express_1.Router)({ mergeParams: true });
commentRouter.post("/", (0, authentication_middleware_1.authentication)(), (0, cloud_multer_1.cloudFileUpload)({ Validation: cloud_multer_1.fileValidation.image }).array("attechment"), comment_service_1.default.createComment);
commentRouter.post("/:commentId/replay", (0, authentication_middleware_1.authentication)(), (0, cloud_multer_1.cloudFileUpload)({ Validation: cloud_multer_1.fileValidation.image }).array("attechment"), comment_service_1.default.replayComment);
exports.default = commentRouter;
