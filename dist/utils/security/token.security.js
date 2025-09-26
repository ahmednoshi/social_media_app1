"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokeToken = exports.decodeToken = exports.createCredentialToken = exports.getSignature = exports.detectSingnatureLevel = exports.verifyToken = exports.generateToken = exports.LogoutEnum = exports.tokenTypeEnum = exports.signatureLevelEnum = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_model_1 = require("../../DB/models/user.model");
const app_Error_1 = require("../response/app.Error");
const user_model_2 = require("./../../DB/models/user.model");
const database_repositry_1 = require("../../DB/repositry/database.repositry");
const uuid_1 = require("uuid");
const token_repositry_1 = require("../../DB/repositry/token.repositry");
const token_model_1 = require("../../DB/models/token.model");
var signatureLevelEnum;
(function (signatureLevelEnum) {
    signatureLevelEnum["Bearer"] = "Bearer";
    signatureLevelEnum["admin"] = "admin";
})(signatureLevelEnum || (exports.signatureLevelEnum = signatureLevelEnum = {}));
var tokenTypeEnum;
(function (tokenTypeEnum) {
    tokenTypeEnum["access"] = "access";
    tokenTypeEnum["refresh"] = "refresh";
})(tokenTypeEnum || (exports.tokenTypeEnum = tokenTypeEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum["only"] = "only";
    LogoutEnum["all"] = "all";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
const generateToken = async ({ payload, secretKey = process.env.SECRET_KEY, options = { expiresIn: Number(process.env.TOKEN_EXPIRES_IN) }, }) => {
    return (0, jsonwebtoken_1.sign)(payload, secretKey, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secretKey = process.env.SECRET_KEY, }) => {
    return (0, jsonwebtoken_1.verify)(token, secretKey);
};
exports.verifyToken = verifyToken;
const detectSingnatureLevel = async (role = user_model_1.RoleEnum.user) => {
    let signatureLevel = signatureLevelEnum.Bearer;
    switch (role) {
        case user_model_1.RoleEnum.admin:
            signatureLevel = signatureLevelEnum.admin;
            break;
        default:
            signatureLevel = signatureLevelEnum.Bearer;
            break;
    }
    return signatureLevel;
};
exports.detectSingnatureLevel = detectSingnatureLevel;
const getSignature = async (SingnatureLevel = signatureLevelEnum.Bearer) => {
    let segnatures = { access_token: "", refresh_token: "" };
    switch (SingnatureLevel) {
        case signatureLevelEnum.admin:
            segnatures.access_token = process.env.SECRET_KEY_ADMIN;
            segnatures.refresh_token = process.env.SECRET_KEY_REFRESH_ADMIN;
            break;
        default:
            segnatures.access_token = process.env.SECRET_KEY;
            segnatures.refresh_token = process.env.SECRET_KEY_REFRESH;
            break;
    }
    return segnatures;
};
exports.getSignature = getSignature;
const createCredentialToken = async (user) => {
    const signatureLevel = await (0, exports.detectSingnatureLevel)(user.role);
    const signature = await (0, exports.getSignature)(signatureLevel);
    console.log({ signature });
    const jwtid = (0, uuid_1.v4)();
    const accessToken = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secretKey: signature.access_token,
        options: { expiresIn: Number(process.env.TOKEN_EXPIRES_IN), jwtid }
    });
    const refreshToken = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secretKey: signature.refresh_token,
        options: { expiresIn: Number(process.env.TOKEN_EXPIRES_IN_REFRESH), jwtid }
    });
    return { accessToken, refreshToken };
};
exports.createCredentialToken = createCredentialToken;
const decodeToken = async ({ authorization, tokenType = tokenTypeEnum.access }) => {
    const userModel = new database_repositry_1.DatabaseRepositry(user_model_2.UserModel);
    const tokenModel = new token_repositry_1.tokenRepositry(token_model_1.TokenModel);
    const [bearerKey, token] = authorization.split(" ");
    if (!token || !bearerKey) {
        throw new app_Error_1.AppError("token is required", 400);
    }
    const signatures = await (0, exports.getSignature)(bearerKey);
    const decoded = await (0, exports.verifyToken)({
        token,
        secretKey: tokenType === tokenTypeEnum.refresh ? signatures.refresh_token : signatures.access_token
    });
    if (!decoded._id || !decoded.iat) {
        throw new app_Error_1.AppError("invalid token", 400);
    }
    if (await tokenModel.findOne({ filter: { jti: decoded.jti } })) {
        throw new app_Error_1.AppError("invalid token", 400);
    }
    const user = await userModel.findOne({
        filter: { _id: decoded._id }
    });
    if (!user) {
        throw new app_Error_1.AppError("user not found", 404);
    }
    if ((user.changeCredentialTime?.getTime() || 0) > decoded.iat * 1000) {
        throw new app_Error_1.AppError("invalid token", 400);
    }
    return { user, decoded };
};
exports.decodeToken = decodeToken;
const createRevokeToken = async (decoded) => {
    const tokenModel = new token_repositry_1.tokenRepositry(token_model_1.TokenModel);
    const [result] = await tokenModel.create({
        data: [{
                jti: decoded?.jti,
                expiresIn: decoded?.iat + Number(process.env.TOKEN_EXPIRES_IN_REFRESH),
                userId: decoded?._id
            }]
    }) || [];
    if (!result) {
        throw new app_Error_1.AppError("fail to create Revoke token", 400);
    }
    return result;
};
exports.createRevokeToken = createRevokeToken;
