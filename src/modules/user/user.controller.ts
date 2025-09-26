import {  Router } from "express";
import UserService from "./user.service";
import * as validators from "./user.validation";
import { validation } from "../../middleware/validation.middleware";
import { authentication } from "../../middleware/authentication.middleware";
import { tokenTypeEnum } from "../../utils/security/token.security";
// import { authentication, authorization } from "../../middleware/authentication.middleware";
// import { endPoint } from "./user.authorization";



const userRouter:Router = Router();


userRouter.post('/signup',validation(validators.signUp),UserService.signUp);
userRouter.patch('/confirm_email',UserService.confirmEmail);
userRouter.post('/login',UserService.login);
userRouter.post('/logout',authentication(),UserService.logout);
userRouter.post('/refresh_token',authentication(tokenTypeEnum.refresh),UserService.refreshToken);
userRouter.patch('/sendForgetPasswordOtp',UserService.sendForgetPasswordOtp);
userRouter.patch('/verifyForgetPasswordOtp',UserService.verifyForgetPasswordOtp);
userRouter.patch('/resetForgetPasswordOtp',UserService.resetForgetPasswordOtp);
userRouter.patch('/freezeAccount/:id',authentication(),UserService.freezeUser);
userRouter.patch('/changePassword',authentication(),UserService.changePassword);



// userRouter.post('/signup',authentication(),validation(validators.signUp),UserService.signUp);
// userRouter.patch('/confirm_email',authorization(endPoint.profile),UserService.confirmEmail);





export default userRouter;