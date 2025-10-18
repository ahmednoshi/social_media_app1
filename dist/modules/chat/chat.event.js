"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatEvent = void 0;
const chat_service_1 = require("./chat.service");
class ChatEvent {
    chatService = new chat_service_1.CahtService();
    constructor() { }
    sayHi = (socket) => {
        socket.on("sayHi", (date, callback) => {
            this.chatService.sayHi({ message: date, socket, callback });
        });
    };
    sendMessage = (socket) => {
        return socket.on("sendMessage", (data) => {
            return this.chatService.sendMessage({ ...data, socket });
        });
    };
    joinRoom = (socket, io) => {
        socket.on("join_room", (data) => {
            return this.chatService.joinRoom({ ...data, socket, io });
        });
    };
    sendGroupMessage = (socket, io) => {
        socket.on("sendGroupMessage", (data) => {
            return this.chatService.sendGroupMessage({ ...data, socket, io });
        });
    };
    typing = (socket, io) => {
        socket.on("typing", (data) => {
            return this.chatService.typing({ ...data, socket, io });
        });
    };
    stopTyping = (socket, io) => {
        socket.on("stopTyping", (data) => {
            return this.chatService.stopTyping({ ...data, socket, io });
        });
    };
}
exports.ChatEvent = ChatEvent;
