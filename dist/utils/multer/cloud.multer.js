"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudFileUpload = exports.fileValidation = exports.storageEnum = void 0;
const multer_1 = __importDefault(require("multer"));
const app_Error_1 = require("../response/app.Error");
const os_1 = __importDefault(require("os"));
const uuid_1 = require("uuid");
var storageEnum;
(function (storageEnum) {
    storageEnum["memory"] = "memory";
    storageEnum["disk"] = "disk";
})(storageEnum || (exports.storageEnum = storageEnum = {}));
exports.fileValidation = {
    image: ["image/png", "image/jpeg", "image/jpg", "image/webp"]
};
const cloudFileUpload = ({ storageAproperties = storageEnum.memory, Validation = exports.fileValidation.image, maxSize = 2 }) => {
    const storage = storageAproperties === storageEnum.memory ? multer_1.default.memoryStorage() : multer_1.default.diskStorage({
        destination: os_1.default.tmpdir(),
        filename(req, file, cb) {
            cb(null, `${(0, uuid_1.v4)()}_${file.originalname}`);
        }
    });
    function fileFilter(req, file, callback) {
        if (!Validation.includes(file.mimetype)) {
            return callback(new app_Error_1.AppError("invalid file type", 400));
        }
        callback(null, true);
    }
    return (0, multer_1.default)({ fileFilter, limits: { fileSize: maxSize * 1024 * 1024 }, storage });
};
exports.cloudFileUpload = cloudFileUpload;
