"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatEvent = void 0;
const chat_service_1 = require("./chat.service");
class ChatEvent {
    chatService = new chat_service_1.CahtService();
    constructor() { }
    sayHi = (socket) => {
        socket.on("say_hi", (date, callback) => {
            this.chatService.sayHi({ message: date, socket, callback });
        });
    };
    sendMessage = (socket) => {
        return socket.on("sendMessage", (data) => {
            return this.chatService.sendMessage({ ...data, socket, });
        });
    };
}
exports.ChatEvent = ChatEvent;
