import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { cloudFileUpload, fileValidation } from "../../utils/multer/cloud.multer";
import CommentService from "./comment.service";


const commentRouter:Router = Router({mergeParams:true});

commentRouter.post("/",
    authentication(),
    cloudFileUpload({Validation:fileValidation.image}).array("attechment"),
    CommentService.createComment
);

commentRouter.post("/:commentId/replay",
    authentication(),
    cloudFileUpload({Validation:fileValidation.image}).array("attechment"),
    CommentService.replayComment

);



export default commentRouter;