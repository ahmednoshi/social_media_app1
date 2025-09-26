"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFiles = exports.uploadFiles = exports.uploadLargeFile = exports.uploadFile = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const cloud_multer_1 = require("../multer/cloud.multer");
const node_fs_1 = require("node:fs");
const app_Error_1 = require("../response/app.Error");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3Client = () => {
    return new client_s3_1.S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    });
};
exports.s3Client = s3Client;
const uploadFile = async ({ storageType = cloud_multer_1.storageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, path = "General", file, ACL = "private", }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}_${file.originalname}`,
        Body: storageType === cloud_multer_1.storageEnum.memory ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
        ContentType: file.mimetype,
    });
    await (0, exports.s3Client)().send(command);
    if (!command.input.Key) {
        throw new app_Error_1.AppError("File not uploaded", 500);
    }
    return command.input.Key;
};
exports.uploadFile = uploadFile;
const uploadLargeFile = async ({ storageType = cloud_multer_1.storageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, path = "General", file, ACL = "private", }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, exports.s3Client)(),
        params: {
            Bucket,
            ACL,
            Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}_${file.originalname}`,
            Body: storageType === cloud_multer_1.storageEnum.memory ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
            ContentType: file.mimetype,
        }
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log(progress);
    });
    const { Key } = await upload.done();
    if (!Key) {
        throw new app_Error_1.AppError("File not uploaded", 500);
    }
    return Key;
};
exports.uploadLargeFile = uploadLargeFile;
const uploadFiles = async ({ storageType = cloud_multer_1.storageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, path = "General", files, ACL = "private", useLarge = false, }) => {
    let urls = [];
    if (useLarge === false) {
        urls = await Promise.all(files.map(file => (0, exports.uploadFile)({ storageType, Bucket, path, file, ACL })));
    }
    else {
        urls = await Promise.all(files.map(file => (0, exports.uploadLargeFile)({ storageType, Bucket, path, file, ACL })));
    }
    return urls;
};
exports.uploadFiles = uploadFiles;
const deleteFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, urls, Quiet = false }) => {
    const Objects = urls.map(url => ({ Key: url }));
    const command = new client_s3_1.DeleteObjectsCommand({
        Bucket,
        Delete: {
            Objects,
            Quiet,
        }
    });
    return await (0, exports.s3Client)().send(command);
};
exports.deleteFiles = deleteFiles;
