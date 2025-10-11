"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CahtService = void 0;
const chat_repositry_1 = require("../../DB/repositry/chat.repositry");
const chat_model_1 = require("../../DB/models/chat.model");
const mongoose_1 = require("mongoose");
const app_Error_1 = require("../../utils/response/app.Error");
const database_repositry_1 = require("../../DB/repositry/database.repositry");
const getway_1 = require("../gateway/getway");
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
            io?.to(getway_1.connectedSockets.get(createBy.toString())).emit("successMessage", { content, sendTo });
            io?.to(getway_1.connectedSockets.get(sendTo)).emit("newMessage", { content, from: socket.credentials?.user });
        }
        catch (error) {
            socket.emit("custom_error", { message: error.message || "Server Error" });
        }
    };
}
exports.CahtService = CahtService;
