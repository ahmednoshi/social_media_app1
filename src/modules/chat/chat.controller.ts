import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { CahtService } from './chat.service';


const chatRouter = Router({ mergeParams: true });
const chatService:CahtService = new CahtService();

chatRouter.get("/",authentication(),chatService.getChat)


export default chatRouter;