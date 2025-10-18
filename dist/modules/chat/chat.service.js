"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CahtService = void 0;
const chat_repositry_1 = require("../../DB/repositry/chat.repositry");
const chat_model_1 = require("../../DB/models/chat.model");
const mongoose_1 = require("mongoose");
const app_Error_1 = require("../../utils/response/app.Error");
const database_repositry_1 = require("../../DB/repositry/database.repositry");
const getway_1 = require("../gateway/getway");
const s3_config_1 = require("../../utils/aws/s3.config");
const uuid_1 = require("uuid");
class CahtService {
    chatModel = new chat_repositry_1.ChatRepositry(chat_model_1.ChatModel);
    userModel = new database_repositry_1.DatabaseRepositry(chat_model_1.ChatModel);
    constructor() { }
    getChat = async (req, res) => {
        const { userId } = req.params;
        const chat = await this.chatModel.findOne({
            filter: {
                participants: {
                    $all: [
                        req.user?._id,
                        mongoose_1.Types.ObjectId.createFromHexString(userId)
                    ]
                },
                group: { $exists: false },
            },
            options: { populate: { path: "participants", select: "userName email profileImage firstName lastName gender" } },
        });
        return res.status(200).json({
            message: chat ? "Chat found" : "No chat found yet",
            success: true,
            data: { chat: chat || null }
        });
    };
    sayHi = ({ message, socket, callback }) => {
        console.log({ message });
        callback ? callback("hi from server") : undefined;
    };
    sendMessage = async ({ content, sendTo, socket, io }) => {
        try {
            const createBy = socket.credentials?.user._id;
            const user = await this.userModel.findOne({
                filter: {
                    _id: mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                    friends: { $in: [createBy] }
                }
            });
            let chat = await this.chatModel.findOneAndUpdate({
                filter: {
                    participants: { $all: [createBy, mongoose_1.Types.ObjectId.createFromHexString(sendTo)] },
                    group: { $exists: false }
                },
                update: {
                    $push: { messages: { content, createBy } }
                },
                options: { new: true }
            });
            if (!chat) {
                const [Newchat] = await this.chatModel.create({
                    data: [{
                            createBy,
                            participants: [createBy, mongoose_1.Types.ObjectId.createFromHexString(sendTo)],
                            messages: [{ content, createBy }]
                        }]
                }) || [];
                if (!Newchat)
                    throw new app_Error_1.AppError("Failed to create chat", 500);
            }
            const senderSockets = getway_1.connectedSockets.get(createBy.toString());
            if (senderSockets?.length) {
                senderSockets.forEach(socketId => {
                    (0, getway_1.getIo)().to(socketId).emit("successMessage", { content, sendTo });
                });
            }
            const receiverSockets = getway_1.connectedSockets.get(sendTo);
            if (receiverSockets?.length) {
                receiverSockets.forEach(socketId => {
                    (0, getway_1.getIo)().to(socketId).emit("newMessage", {
                        content,
                        from: socket.credentials?.user
                    });
                });
            }
        }
        catch (error) {
            socket.emit("custom_error", { message: error.message || "Server Error" });
        }
    };
    createGroup = async (req, res) => {
        const { group, participants } = req.body;
        const dbparticipants = participants.map((participant) => { return mongoose_1.Types.ObjectId.createFromHexString(participant); });
        const user = await this.userModel.find({
            filter: { _id: { $in: dbparticipants }, friends: { $in: [req.user?._id] } },
        });
        let group_image = undefined;
        const roomId = group.replaceAll(/\s+/g, "_") + "_" + (0, uuid_1.v4)();
        if (req.file) {
            group_image = await (0, s3_config_1.uploadFile)({ file: req.file, path: `/chat/group/${roomId}` });
        }
        dbparticipants.push(req.user?._id);
        const [newGroup] = await this.chatModel.create({ data: [{
                    createBy: req.user?._id,
                    group,
                    groupImage: group_image,
                    roomId,
                    participants: dbparticipants,
                    messages: []
                }]
        }) || [];
        if (!newGroup) {
            if (group_image) {
                await (0, s3_config_1.deleteFiles)({ urls: [group_image] });
            }
            throw new app_Error_1.AppError("Failed to create group", 500);
        }
        return res.status(201).json({
            message: "Group created",
            success: true,
            data: { group: newGroup }
        });
    };
    getGroupChat = async (req, res) => {
        const { groupId } = req.params;
        const chat = await this.chatModel.findOne({
            filter: {
                group: { $exists: true },
                _id: mongoose_1.Types.ObjectId.createFromHexString(groupId),
                participants: { $in: [req.user?._id] },
            },
            options: { populate: { path: "messages.createBy", select: "userName email groupImage firstName lastName gender" } },
        });
        return res.status(200).json({
            message: chat ? "Chat found" : "No chat found yet",
            success: true,
            data: { chat: chat || null }
        });
    };
    joinRoom = async ({ roomId, socket, io }) => {
        try {
            const chat = await this.chatModel.findOne({
                filter: {
                    roomId,
                    group: { $exists: true },
                    participants: { $in: [socket.credentials?.user._id] },
                }
            });
            if (!chat)
                throw new app_Error_1.AppError("Chat not found", 404);
            socket.join(chat.roomId);
        }
        catch (error) {
            socket.emit("custom_error", { message: error.message || "Server Error" });
        }
    };
    sendGroupMessage = async ({ content, groupId, socket, io }) => {
        try {
            const createBy = socket.credentials?.user._id;
            let chat = await this.chatModel.findOneAndUpdate({
                filter: {
                    _id: mongoose_1.Types.ObjectId.createFromHexString(groupId),
                    participants: { $in: [createBy] },
                    group: { $exists: true },
                },
                update: {
                    $push: { messages: { content, createBy } }
                },
                options: { new: true }
            });
            if (!chat) {
                if (!chat)
                    throw new app_Error_1.AppError("falid find match caht", 500);
            }
            const senderSockets = getway_1.connectedSockets.get(createBy.toString());
            if (senderSockets?.length) {
                senderSockets.forEach(socketId => {
                    (0, getway_1.getIo)().to(socketId).emit("successMessage", { content, from: socket.credentials?.user });
                });
            }
            const receiverSockets = getway_1.connectedSockets.get(chat.roomId);
            if (receiverSockets?.length) {
                receiverSockets.forEach(socketId => {
                    socket.to(socketId).emit("newMessage", {
                        content,
                        from: socket.credentials?.user,
                        groupId
                    });
                });
            }
        }
        catch (error) {
            socket.emit("custom_error", { message: error.message || "Server Error" });
        }
    };
    typing = async ({ sendTo, socket, io }) => {
        const senderId = socket.credentials?.user._id.toString();
        const receiverSockets = getway_1.connectedSockets.get(sendTo);
        if (receiverSockets?.length) {
            receiverSockets.forEach(socketId => {
                (0, getway_1.getIo)().to(socketId).emit("typing", { from: {
                        _id: senderId,
                        firstName: `${socket.credentials?.user.firstName} ${socket.credentials?.user.lastName}`,
                    } });
            });
        }
    };
    stopTyping = async ({ sendTo, socket, io }) => {
        const senderId = socket.credentials?.user._id.toString();
        const receiverSockets = getway_1.connectedSockets.get(sendTo);
        if (receiverSockets?.length) {
            receiverSockets.forEach(socketId => {
                (0, getway_1.getIo)().to(socketId).emit("stopTyping", { from: {
                        _id: senderId,
                        firstName: `${socket.credentials?.user.firstName} ${socket.credentials?.user.lastName}`
                    } });
            });
        }
    };
}
exports.CahtService = CahtService;
