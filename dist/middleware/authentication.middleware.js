"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = void 0;
const token_security_1 = require("../utils/security/token.security");
const authentication = (tokenType = token_security_1.tokenTypeEnum.access) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new Error("token is required");
        }
        const { decoded, user } = await (0, token_security_1.decodeToken)({ authorization: req.headers.authorization, tokenType });
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRole = [], tokenType = token_security_1.tokenTypeEnum.access) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new Error("token is required");
        }
        const { decoded, user } = await (0, token_security_1.decodeToken)({ authorization: req.headers.authorization, tokenType });
        if (!accessRole.includes(user.role)) {
            throw new Error("unauthorized");
        }
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authorization = authorization;
