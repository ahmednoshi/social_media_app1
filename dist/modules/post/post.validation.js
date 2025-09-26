"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = void 0;
const zod_1 = require("zod");
const post_model_1 = require("../../DB/models/post.model");
exports.createPost = {
    body: zod_1.z.strictObject({
        description: zod_1.z.string().min(5).max(20000).optional(),
        attechment: zod_1.z.union([
            zod_1.z.any(),
            zod_1.z.array(zod_1.z.any())
        ]).optional(),
        tags: zod_1.z.union([
            zod_1.z.string(),
            zod_1.z.array(zod_1.z.string())
        ]).optional(),
        allowComment: zod_1.z.enum(post_model_1.allowCommentEnum).default(post_model_1.allowCommentEnum.alow),
        availapility: zod_1.z.enum(post_model_1.availapilityEnum).default(post_model_1.availapilityEnum.public),
    }).superRefine((data, ctx) => {
        if (!data.attechment && !data.description) {
            ctx.addIssue({
                code: "custom",
                message: "can't create post without attechment or description",
                path: ["attechment"],
            });
        }
    }),
};
