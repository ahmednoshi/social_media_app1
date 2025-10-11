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

commentRouter.delete("/:commentId/delete",
    authentication(),
    CommentService.deleteComment
);


commentRouter.post("/freeze/:commentId",
    authentication(),
    CommentService.freezeComment
);


commentRouter.patch("/update/:commentId",
    authentication(),
    cloudFileUpload({Validation:fileValidation.image}).array("attechment"),
    CommentService.updateComment
);


commentRouter.post("/getCommentById/:commentId",
    authentication(),
    CommentService.getCommentsById
);



export default commentRouter;