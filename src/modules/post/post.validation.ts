
import { z} from "zod";
import { allowCommentEnum, availapilityEnum } from "../../DB/models/post.model";



export const createPost = {
  body: z.strictObject({
    description: z.string().min(5).max(20000).optional(),

    attechment: z.union([
      z.any(),             // ملف واحد (object)
      z.array(z.any())     // أو Array من الملفات
    ]).optional(),

    tags: z.union([
      z.string(),          // tag واحد بس
      z.array(z.string())  // أو Array من tags
    ]).optional(),



    allowComment: z.enum(allowCommentEnum).default(allowCommentEnum.alow),

    availapility: z.enum(availapilityEnum).default(availapilityEnum.public),
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