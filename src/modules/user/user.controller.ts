import  {  Router } from "express";
import UserService from "./user.service";
import * as validators from "./user.validation";
import { validation } from "../../middleware/validation.middleware";
import { authentication, authorization } from "../../middleware/authentication.middleware";
import { tokenTypeEnum } from "../../utils/security/token.security";
import { endPoint } from "./user.authorization";
import chatRouter from "../chat/chat.controller";
// import { authentication, authorization } from "../../middleware/authentication.middleware";
// import { endPoint } from "./user.authorization";



const userRouter:Router = Router();

userRouter.use("/:userId/chat",chatRouter)


userRouter.post('/signup',validation(validators.signUp),UserService.signUp);
userRouter.patch('/confirm_email',UserService.confirmEmail);
userRouter.post('/login',UserService.login);
userRouter.post('/logout',authentication(),UserService.logout);
userRouter.post('/refresh_token',authentication(tokenTypeEnum.refresh),UserService.refreshToken);
userRouter.patch('/sendForgetPasswordOtp',UserService.sendForgetPasswordOtp);
userRouter.patch('/verifyForgetPasswordOtp',UserService.verifyForgetPasswordOtp);
userRouter.patch('/resetForgetPasswordOtp',UserService.resetForgetPasswordOtp);
userRouter.delete('/freezeAccount/:id',authentication(),UserService.freezeUser);
userRouter.patch('/changePassword',authentication(),UserService.changePassword);
userRouter.get('/dashBorad',authorization(endPoint.dashBorad),UserService.dashBorad);
userRouter.patch('/:userId/changeRole',authorization(endPoint.dashBorad),UserService.changeRole);
userRouter.post('/:userId/send-freinds-request',authentication(),UserService.sendFreindsRequest);
userRouter.patch('/accept-freinds-request/:id',authentication(),UserService.acceptFreindsRequest);
userRouter.patch('/reSendOtp',UserService.reSendOtp);
userRouter.get('/profile',authentication(),UserService.shareProfile);
userRouter.delete('/deleteAccount/:userId',authentication(),authorization(endPoint.dashBorad),UserService.unFreezeUser);
userRouter.patch('/updateEmail{/:userId}',authentication(),UserService.updateEamil);
userRouter.patch('/updateProfile{/:userId}',authentication(),UserService.updateProfile);
userRouter.patch('/toggleTwoStepVerification',authentication(),UserService.twoStepVerification);
userRouter.patch('/verifyTwoStepVerification/:userId',authentication(),UserService.verifyTwoStepVerification);
userRouter.post('/verifyLoginOtp',UserService.verifyLoginOtp);
userRouter.get("/getprofile",authentication(),UserService.getProfile);
userRouter.patch("/blockUser/:userId",authentication(),UserService.blockUser);
userRouter.delete("/deleteFriend/:id",authentication(),UserService.deleteFrinedsRequest);
userRouter.post("/unFrineds/:id",authentication(),UserService.unFrineds);





// userRouter.post('/signup',authentication(),validation(validators.signUp),UserService.signUp);
// userRouter.patch('/confirm_email',authorization(endPoint.profile),UserService.confirmEmail);





export default userRouter;