"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const validators = __importStar(require("./user.validation"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const authentication_middleware_1 = require("../../middleware/authentication.middleware");
const token_security_1 = require("../../utils/security/token.security");
const user_authorization_1 = require("./user.authorization");
const chat_controller_1 = __importDefault(require("../chat/chat.controller"));
const userRouter = (0, express_1.Router)();
userRouter.use("/:userId/chat", chat_controller_1.default);
userRouter.post('/signup', (0, validation_middleware_1.validation)(validators.signUp), user_service_1.default.signUp);
userRouter.patch('/confirm_email', user_service_1.default.confirmEmail);
userRouter.post('/login', user_service_1.default.login);
userRouter.post('/logout', (0, authentication_middleware_1.authentication)(), user_service_1.default.logout);
userRouter.post('/refresh_token', (0, authentication_middleware_1.authentication)(token_security_1.tokenTypeEnum.refresh), user_service_1.default.refreshToken);
userRouter.patch('/sendForgetPasswordOtp', user_service_1.default.sendForgetPasswordOtp);
userRouter.patch('/verifyForgetPasswordOtp', user_service_1.default.verifyForgetPasswordOtp);
userRouter.patch('/resetForgetPasswordOtp', user_service_1.default.resetForgetPasswordOtp);
userRouter.delete('/freezeAccount/:id', (0, authentication_middleware_1.authentication)(), user_service_1.default.freezeUser);
userRouter.patch('/changePassword', (0, authentication_middleware_1.authentication)(), user_service_1.default.changePassword);
userRouter.get('/dashBorad', (0, authentication_middleware_1.authorization)(user_authorization_1.endPoint.dashBorad), user_service_1.default.dashBorad);
userRouter.patch('/:userId/changeRole', (0, authentication_middleware_1.authorization)(user_authorization_1.endPoint.dashBorad), user_service_1.default.changeRole);
userRouter.post('/:userId/send-freinds-request', (0, authentication_middleware_1.authentication)(), user_service_1.default.sendFreindsRequest);
userRouter.patch('/accept-freinds-request/:id', (0, authentication_middleware_1.authentication)(), user_service_1.default.acceptFreindsRequest);
userRouter.patch('/reSendOtp', user_service_1.default.reSendOtp);
userRouter.get('/profile', (0, authentication_middleware_1.authentication)(), user_service_1.default.shareProfile);
userRouter.delete('/deleteAccount/:userId', (0, authentication_middleware_1.authentication)(), (0, authentication_middleware_1.authorization)(user_authorization_1.endPoint.dashBorad), user_service_1.default.unFreezeUser);
userRouter.patch('/updateEmail{/:userId}', (0, authentication_middleware_1.authentication)(), user_service_1.default.updateEamil);
userRouter.patch('/updateProfile{/:userId}', (0, authentication_middleware_1.authentication)(), user_service_1.default.updateProfile);
userRouter.patch('/toggleTwoStepVerification', (0, authentication_middleware_1.authentication)(), user_service_1.default.twoStepVerification);
userRouter.patch('/verifyTwoStepVerification/:userId', (0, authentication_middleware_1.authentication)(), user_service_1.default.verifyTwoStepVerification);
userRouter.post('/verifyLoginOtp', user_service_1.default.verifyLoginOtp);
userRouter.get("/getprofile", (0, authentication_middleware_1.authentication)(), user_service_1.default.getProfile);
userRouter.patch("/blockUser/:userId", (0, authentication_middleware_1.authentication)(), user_service_1.default.blockUser);
userRouter.delete("/deleteFriend/:id", (0, authentication_middleware_1.authentication)(), user_service_1.default.deleteFrinedsRequest);
userRouter.post("/unFrineds/:id", (0, authentication_middleware_1.authentication)(), user_service_1.default.unFrineds);
exports.default = userRouter;
