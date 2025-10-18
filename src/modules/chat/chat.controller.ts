import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { CahtService } from './chat.service';
import { cloudFileUpload, fileValidation } from "../../utils/multer/cloud.multer";


const chatRouter = Router({ mergeParams: true });
const chatService:CahtService = new CahtService();

chatRouter.get("/",authentication(),chatService.getChat)
chatRouter.post("/group",authentication(),cloudFileUpload({Validation:fileValidation.image}).single("attachment"),chatService.createGroup)
chatRouter.get("/group/:groupId",authentication(),chatService.getGroupChat)


export default chatRouter;