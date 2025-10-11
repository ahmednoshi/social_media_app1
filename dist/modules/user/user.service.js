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
const mongoose_1 = require("mongoose");
const token_model_1 = require("../../DB/models/token.model");
const token_repositry_1 = require("../../DB/repositry/token.repositry");
const post_model_1 = require("./../../DB/models/post.model");
const post_repositry_1 = require("../../DB/repositry/post.repositry");
const friendsRequest_repositry_1 = require("../../DB/repositry/friendsRequest.repositry");
const friends_Request_model_1 = require("../../DB/models/friends.Request.model");
class UserService {
    userModel = new database_repositry_1.DatabaseRepositry(user_model_1.UserModel);
    postModel = new post_repositry_1.PostRepositry(post_model_1.PostModel);
    friendsRequestModel = new friendsRequest_repositry_1.friendsRequestRepositry(friends_Request_model_1.friendsRequestModel);
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
        if (user.twoStepVerification === false) {
            const Credentials = await (0, token_security_1.createCredentialToken)(user);
            return res.status(200).json({ message: "login successfully", data: { Credentials } });
        }
        else {
            const otp = (0, otp_1.generateOtp)();
            await this.userModel.findOneAndUpdate({
                filter: { _id: user._id },
                update: { confirmEmailOtp: `${String(otp)}` },
                options: { new: true }
            });
            return res.status(200).json({ message: "two step verification code sent to your email" });
        }
    };
    verifyLoginOtp = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({ filter: { email } });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        if (!await (0, hash_security_1.compareHash)(otp, user.confirmEmailOtp)) {
            throw new app_Error_1.AppError("invalid otp", 400);
        }
        await this.userModel.findOneAndUpdate({
            filter: { _id: user._id },
            update: { $unset: { confirmEmailOtp: 1 } },
            options: { new: true }
        });
        const Credentials = await (0, token_security_1.createCredentialToken)(user);
        return res.status(200).json({
            message: "login successful",
            data: { Credentials }
        });
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
    dashBorad = async (req, res) => {
        const result = await Promise.allSettled([
            this.userModel.find({ filter: {} }),
            this.postModel.find({ filter: {} }),
        ]);
        return res.status(200).json({ message: "dashboard", data: { result } });
    };
    changeRole = async (req, res) => {
        const { userId } = req.params;
        const { role } = req.body;
        const denyRloes = [role, user_model_1.RoleEnum.superAdmin];
        if (req.user?.role === user_model_1.RoleEnum.admin) {
            denyRloes.push(user_model_1.RoleEnum.admin);
        }
        const user = await this.userModel.findOneAndUpdate({
            filter: { _id: userId, role: { $nin: denyRloes } },
            update: { role },
            options: { new: true }
        });
        console.log(user, userId, role);
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        return res.status(200).json({ message: "role changed successfully" });
    };
    sendFreindsRequest = async (req, res) => {
        const { userId } = req.params;
        const freindsRequestExists = await this.friendsRequestModel.findOne({
            filter: {
                createBy: { $in: [req.user?._id, userId] },
                senderTo: { $in: [req.user?._id, userId] },
            }
        });
        if (freindsRequestExists) {
            throw new app_Error_1.AppError("freinds request already exists", 400);
        }
        const user = await this.userModel.findOne({
            filter: { _id: userId }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        const [freindsRequest] = await this.friendsRequestModel.create({
            data: [{
                    createBy: req.user?._id,
                    senderTo: userId,
                    status: friends_Request_model_1.statusEnum.pending
                }]
        }) || [];
        if (!freindsRequest) {
            throw new app_Error_1.AppError("fail to send freinds request", 400);
        }
        return res.status(200).json({ message: "freinds request sent successfully", data: { freindsRequest } });
    };
    acceptFreindsRequest = async (req, res) => {
        const { id } = req.params;
        const freindsRequest = await this.friendsRequestModel.findOneAndUpdate({
            filter: { _id: id, senderTo: req.user?._id, status: friends_Request_model_1.statusEnum.pending },
            update: { accepted: new Date(), status: friends_Request_model_1.statusEnum.accepted },
            options: { new: true }
        });
        if (!freindsRequest) {
            throw new app_Error_1.AppError("freinds request not found", 404);
        }
        await Promise.all([
            await this.userModel.updateOne({
                filter: { _id: freindsRequest.createBy },
                update: { $addToSet: { friends: freindsRequest.senderTo } }
            }),
            await this.userModel.updateOne({
                filter: { _id: freindsRequest.senderTo },
                update: { $addToSet: { friends: freindsRequest.createBy } }
            })
        ]);
        return res.status(200).json({ message: "freinds request accepted successfully" });
    };
    reSendOtp = async (req, res) => {
        const { email } = req.body;
        const user = await this.userModel.findOne({
            filter: { email, confirmAT: { $exists: false } }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        const otp = await (0, otp_1.generateOtp)();
        await this.userModel.findOneAndUpdate({
            filter: { email, confirmAT: { $exists: false } },
            update: { confirmEmailOtp: `${String(otp)}` },
            options: { new: true }
        });
        return res.status(200).json({ message: "otp re-send successfully", });
    };
    shareProfile = async (req, res) => {
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        return res.status(200).json({ message: fullUrl });
    };
    unFreezeUser = async (req, res) => {
        const { userId } = req.params;
        if (req.user?.role !== user_model_1.RoleEnum.superAdmin && req.user?.role !== user_model_1.RoleEnum.admin) {
            throw new app_Error_1.AppError("only super admin and admin can unfreeze user", 403);
        }
        const user = await this.userModel.findOneAndUpdate({
            filter: { _id: userId, freeze: true },
            update: {
                $unset: { freezeAt: 1, freezeBy: 1 },
                reStoreAt: new Date(),
                reStoreBy: req.user?._id
            },
            options: { new: true }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        return res.status(200).json({ message: "user unfrozen successfully" });
    };
    updateEamil = async (req, res) => {
        const { email } = req.body;
        const { userId } = req.params;
        if (!email) {
            throw new app_Error_1.AppError("email is required", 400);
        }
        let targetUserId = req.user._id;
        if (req.user?.role === user_model_1.RoleEnum.admin || req.user?.role === user_model_1.RoleEnum.superAdmin) {
            if (userId) {
                targetUserId = new mongoose_1.Types.ObjectId(userId);
            }
        }
        else {
            if (userId && !new mongoose_1.Types.ObjectId(userId).equals(req.user?._id)) {
                throw new app_Error_1.AppError("only super admin and super admin can update other users' email", 403);
            }
        }
        const user = await this.userModel.findOneAndUpdate({
            filter: { _id: targetUserId },
            update: { email },
            options: { new: true }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        return res.status(200).json({ message: "email updated successfully" });
    };
    updateProfile = async (req, res) => {
        const { firstName, lastName, gender } = req.body;
        const { userId } = req.params;
        let targetUserId = req.user._id;
        if (req.user?.role === user_model_1.RoleEnum.admin || req.user?.role === user_model_1.RoleEnum.superAdmin) {
            if (userId) {
                targetUserId = new mongoose_1.Types.ObjectId(userId);
            }
        }
        else {
            if (userId && !new mongoose_1.Types.ObjectId(userId).equals(req.user?._id)) {
                throw new app_Error_1.AppError("only super admin and super admin can update other users' profile", 403);
            }
        }
        const user = await this.userModel.findOneAndUpdate({
            filter: { _id: targetUserId },
            update: { firstName, lastName, gender },
            options: { new: true }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        return res.status(200).json({ message: "profile updated successfully", data: { user } });
    };
    twoStepVerification = async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new app_Error_1.AppError("email and password are required", 400);
        }
        const user = await this.userModel.findOne({
            filter: { email }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        if (!await (0, hash_security_1.compareHash)(password, user.password)) {
            throw new app_Error_1.AppError("invalid password", 400);
        }
        const otp = (0, otp_1.generateOtp)();
        await this.userModel.findOneAndUpdate({
            filter: { _id: user?._id },
            update: { confirmEmailOtp: `${String(otp)}` },
            options: { new: true }
        });
        return res.status(200).json({ message: "otp sent successfully" });
    };
    verifyTwoStepVerification = async (req, res) => {
        const userId = req.user?._id;
        const { email, otp } = req.body;
        if (!email || !otp) {
            throw new app_Error_1.AppError("email and otp are required", 400);
        }
        const user = await this.userModel.findOne({
            filter: { email, confirmEmailOtp: { $exists: true }, _id: userId }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        if (!await (0, hash_security_1.compareHash)(otp, user.confirmEmailOtp)) {
            throw new app_Error_1.AppError("invalid otp", 400);
        }
        await this.userModel.findOneAndUpdate({
            filter: { _id: user?._id },
            update: { twoStepVerification: true, $unset: { confirmEmailOtp: 1 } },
            options: { new: true }
        });
        return res.status(200).json({ message: "otp verified successfully" });
    };
    getProfile = async (req, res) => {
        const user = await this.userModel.findOne({
            filter: { _id: req.user?._id },
            options: { populate: { path: "friends" } }
        });
        return res.status(200).json({ message: "Done", success: true, data: { user, groups: [] } });
    };
    blockUser = async (req, res) => {
        const { userId } = req.params;
        if (req.user?._id.equals(userId)) {
            throw new app_Error_1.AppError("you can not block yourself", 400);
        }
        const userToBlock = await this.userModel.findOne({
            filter: { _id: userId }
        });
        if (!userToBlock) {
            throw new app_Error_1.AppError("user to block not found", 404);
        }
        const user = await this.userModel.findOneAndUpdate({
            filter: { _id: req.user?._id },
            update: { $addToSet: { blockedUsers: userId }, $pull: { friends: userId } },
            options: { new: true }
        });
        await this.userModel.updateOne({
            filter: { _id: userId },
            update: { $pull: { friends: req.user?._id } }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        return res.status(200).json({ message: "user blocked successfully" });
    };
    deleteFrinedsRequest = async (req, res) => {
        const { id } = req.params;
        const freindsRequest = await this.friendsRequestModel.findOne({
            filter: { _id: id, $or: [{ createBy: req.user?._id }, { senderTo: req.user?._id }] }
        });
        if (!freindsRequest) {
            throw new app_Error_1.AppError("freinds request not found", 404);
        }
        await this.friendsRequestModel.deleteOne({ filter: { _id: id } });
        return res.status(200).json({ message: "freinds request deleted successfully" });
    };
    unFrineds = async (req, res) => {
        const { id } = req.params;
        const friendsRequset = await this.friendsRequestModel.findOne({
            filter: { _id: id, $or: [{ createBy: req.user?._id }, { senderTo: req.user?._id }], status: friends_Request_model_1.statusEnum.accepted }
        });
        if (!friendsRequset) {
            throw new app_Error_1.AppError("freinds request not found", 404);
        }
        const user = await this.userModel.findOneAndUpdate({
            filter: { _id: friendsRequset.senderTo },
            update: { $pull: { friends: friendsRequset.createBy } },
            options: { new: true }
        });
        await this.userModel.findOneAndUpdate({
            filter: { _id: friendsRequset.createBy },
            update: { $pull: { friends: friendsRequset.senderTo } },
            options: { new: true }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        return res.status(200).json({ message: "Done" });
    };
}
exports.default = new UserService;
