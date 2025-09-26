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
const userRouter = (0, express_1.Router)();
userRouter.post('/signup', (0, validation_middleware_1.validation)(validators.signUp), user_service_1.default.signUp);
userRouter.patch('/confirm_email', user_service_1.default.confirmEmail);
userRouter.post('/login', user_service_1.default.login);
userRouter.post('/logout', (0, authentication_middleware_1.authentication)(), user_service_1.default.logout);
userRouter.post('/refresh_token', (0, authentication_middleware_1.authentication)(token_security_1.tokenTypeEnum.refresh), user_service_1.default.refreshToken);
userRouter.patch('/sendForgetPasswordOtp', user_service_1.default.sendForgetPasswordOtp);
userRouter.patch('/verifyForgetPasswordOtp', user_service_1.default.verifyForgetPasswordOtp);
userRouter.patch('/resetForgetPasswordOtp', user_service_1.default.resetForgetPasswordOtp);
userRouter.patch('/freezeAccount/:id', (0, authentication_middleware_1.authentication)(), user_service_1.default.freezeUser);
userRouter.patch('/changePassword', (0, authentication_middleware_1.authentication)(), user_service_1.default.changePassword);
exports.default = userRouter;
