"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_repositry_1 = require("../../DB/repositry/database.repositry");
const user_model_1 = require("../../DB/models/user.model");
const app_Error_1 = require("../../utils/response/app.Error");
const hash_security_1 = require("./../../utils/security/hash.security");
const email_event_1 = __importDefault(require("../../utils/event/email.event"));
const otp_1 = require("../../utils/otp");
const token_security_1 = require("./../../utils/security/token.security");
const token_model_1 = require("../../DB/models/token.model");
const token_repositry_1 = require("../../DB/repositry/token.repositry");
class UserService {
    userModel = new database_repositry_1.DatabaseRepositry(user_model_1.UserModel);
    tokenModel = new token_repositry_1.tokenRepositry(token_model_1.TokenModel);
    signUp = async (req, res) => {
        const { firstName, lastName, email, password, role } = req.body;
        const otp = (0, otp_1.generateOtp)();
        const [user] = await this.userModel.create({
            data: [{ firstName, lastName, email, role, password, confirmEmailOtp: `${String(otp)}` }],
            options: { validateBeforeSave: true },
        }) || [];
        if (!user) {
            throw new app_Error_1.AppError("fail to create user", 404);
        }
        return res.status(201).json({ message: "user created successfully", data: { user } });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                confirmEmailOtp: { $exists: true },
                confirmAT: { $exists: false },
            }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        if (!await (0, hash_security_1.compareHash)(otp, user.confirmEmailOtp)) {
            throw new app_Error_1.AppError("invalid otp", 400);
        }
        await this.userModel.updateOne({
            filter: { email },
            update: {
                confirmAT: new Date(),
                $unset: { confirmEmailOtp: true }
            }
        });
        return res.status(200).json({ message: "email confirmed successfully" });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this.userModel.findOne({
            filter: { email }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        if (!user.confirmAT) {
            throw new app_Error_1.AppError("email not confirmed", 400);
        }
        if (!await (0, hash_security_1.compareHash)(password, user.password)) {
            throw new app_Error_1.AppError("invalid password", 400);
        }
        const Credentials = await (0, token_security_1.createCredentialToken)(user);
        return res.status(200).json({ message: "login successfully", data: { Credentials } });
    };
    logout = async (req, res) => {
        const { flag } = req.body;
        const update = {};
        switch (flag) {
            case token_security_1.LogoutEnum.all:
                update.changeCredentialTime = new Date();
                break;
            default:
                await (0, token_security_1.createRevokeToken)(req.decoded);
                break;
        }
        await this.userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update,
        });
        return res.status(200).json({ message: "logout successfully" });
    };
    refreshToken = async (req, res) => {
        const Credentials = await (0, token_security_1.createCredentialToken)(req.user);
        await (0, token_security_1.createRevokeToken)(req.decoded);
        return res.status(201).json({ message: "refresh token successfully", data: { Credentials } });
    };
    sendForgetPasswordOtp = async (req, res) => {
        const { email } = req.body;
        const user = await this.userModel.findOne({
            filter: { email, confirmAT: { $exists: true } }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        const otp = (0, otp_1.generateOtp)();
        const result = await this.userModel.updateOne({
            filter: { email },
            update: {
                resetPasswordOtp: await (0, hash_security_1.generateHash)(String(otp))
            }
        });
        if (!result.modifiedCount) {
            throw new app_Error_1.AppError("fail to send otp", 400);
        }
        email_event_1.default.emit("resetPassword", { to: email, otp });
        return res.status(200).json({ message: "otp sent successfully" });
    };
    verifyForgetPasswordOtp = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({
            filter: { email, resetPasswordOtp: { $exists: true } }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        if (!await (0, hash_security_1.compareHash)(otp, user.resetPasswordOtp)) {
            throw new app_Error_1.AppError("invalid otp", 400);
        }
        return res.status(200).json({ message: "otp verified successfully" });
    };
    resetForgetPasswordOtp = async (req, res) => {
        const { email, otp, password } = req.body;
        const user = await this.userModel.findOne({
            filter: { email, resetPasswordOtp: { $exists: true } }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        if (!await (0, hash_security_1.compareHash)(otp, user.resetPasswordOtp)) {
            throw new app_Error_1.AppError("invalid otp", 400);
        }
        await this.userModel.updateOne({
            filter: { email },
            update: {
                password: await (0, hash_security_1.generateHash)(password),
                changeCredentialTime: new Date(),
                $unset: { resetPasswordOtp: true },
            }
        });
        return res.status(200).json({ message: "password reset successfully" });
    };
    freezeUser = async (req, res) => {
        const { id } = req.params;
        if (!id && req.user?.role !== user_model_1.RoleEnum.admin) {
            throw new app_Error_1.AppError("unauthorized", 401);
        }
        await this.userModel.findOneAndUpdate({
            filter: { _id: id || req.user?._id },
            update: {
                freezeAT: true,
                changeCredentialTime: new Date(),
                $set: { freezeBy: req.user?._id }
            },
            options: { new: true }
        });
        return res.status(200).json({ message: "user freeze successfully" });
    };
    changePassword = async (req, res) => {
        const { password, newPassword, confirmPassword } = req.body;
        const user = await this.userModel.findById({ id: req.user?._id, projection: "+password" });
        if (!await (0, hash_security_1.compareHash)(password, user?.password)) {
            throw new app_Error_1.AppError("invalid password", 400);
        }
        if (newPassword !== confirmPassword) {
            throw new app_Error_1.AppError("passwords do not match", 400);
        }
        await this.userModel.findOneAndUpdate({
            filter: { _id: req.user?._id },
            update: { password: await (0, hash_security_1.generateHash)(newPassword), changeCredentialTime: new Date() }
        });
        return res.status(200).json({ message: "password changed successfully" });
    };
}
exports.default = new UserService;
