"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstarap = void 0;
const node_path_1 = require("node:path");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({
    path: (0, node_path_1.resolve)("./config/.env.development")
});
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const user_controller_1 = __importDefault(require("./modules/user/user.controller"));
const app_Error_1 = require("./utils/response/app.Error");
const connection_1 = __importDefault(require("./DB/connection"));
const post_controller_1 = __importDefault(require("./modules/post/post.controller"));
const multer_1 = __importDefault(require("multer"));
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    statusCode: 429,
});
const bootstarap = async () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    const upload = (0, multer_1.default)();
    app.use(upload.none());
    const PORT = process.env.PORT || 5000;
    app.use((0, cors_1.default)(), (0, helmet_1.default)(), limiter);
    app.use("/user", user_controller_1.default);
    app.use("/post", post_controller_1.default);
    app.get('/', (req, res) => {
        res.send(`welcome to ${process.env.APPLICATION_NAME} ❤️ 🐉`);
    });
    app.use("{/*dummy}", (req, res) => {
        throw new app_Error_1.AppError("route not found", 404);
    });
    app.use((err, req, res, next) => {
        return res.status(err.statusCode || 500).json({
            message: err.message || "something went wrong",
            stack: process.env.MOOD === "development" ? err.stack : undefined,
            error: err
        });
    });
    await (0, connection_1.default)();
    app.listen(PORT, () => {
        console.log(`Example app listening on ${PORT} !!!!`);
    });
};
exports.bootstarap = bootstarap;
