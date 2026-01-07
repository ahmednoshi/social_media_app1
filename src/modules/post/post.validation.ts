
import { z} from "zod";
import { allowCommentEnum, availapilityEnum } from "../../DB/models/post.model";



export const createPost = {
  body: z.strictObject({
    description: z.string().min(5).max(20000).optional(),

    tags: z.union([
      z.string(),
      z.array(z.string())
    ]).optional(),

    allowComment: z.enum(allowCommentEnum).default(allowCommentEnum.alow),
    availapility: z.enum(availapilityEnum).default(availapilityEnum.public),
  }).superRefine((data, ctx) => {
    if (!data.description) {
      ctx.addIssue({
        code: "custom",
        message: "can't create post without description or attachment",
        path: ["description"],
      });
    }
  }),
};
