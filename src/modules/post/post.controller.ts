
import { Router } from "express";
import  {postService} from "./post.service"; 
import { authentication } from "../../middleware/authentication.middleware";
import { cloudFileUpload, fileValidation } from "../../utils/multer/cloud.multer";
import { validation } from "../../middleware/validation.middleware";
import * as validators  from "./post.validation";
import commentRouter from "../comment/comment.controller";



const postRouter:Router = Router();

postRouter.use("/:postId/comment",commentRouter)


postRouter.post("/createPost",authentication(),cloudFileUpload({Validation:fileValidation.image}).array("attechment"),validation(validators.createPost),postService.createPost);

postRouter.patch("/:postId",authentication(),postService.likesPost);

postRouter.patch("/disLike/:postId",authentication(),postService.disLike);


// postRouter.patch("/toggleLike/:postId",authentication(),postService.toggleLike);


postRouter.patch("/updatePost/:postId/",authentication(),cloudFileUpload({Validation:fileValidation.image}).array("attechment"),postService.updatePost);








export default postRouter