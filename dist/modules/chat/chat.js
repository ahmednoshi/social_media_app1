"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateWay = void 0;
const chat_event_1 = require("./chat.event");
class ChatGateWay {
    chatEvent = new chat_event_1.ChatEvent();
    constructor() { }
    register = (socket, io) => {
        this.chatEvent.sayHi(socket);
        this.chatEvent.sendMessage(socket);
        this.chatEvent.joinRoom(socket, io);
        this.chatEvent.sendGroupMessage(socket, io);
        this.chatEvent.typing(socket, io);
        this.chatEvent.stopTyping(socket, io);
    };
}
exports.ChatGateWay = ChatGateWay;
