"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initializeIo = exports.connectedSockets = void 0;
const socket_io_1 = require("socket.io");
const token_security_1 = require("../../utils/security/token.security");
const chat_1 = require("./../chat/chat");
exports.connectedSockets = new Map();
let io = undefined;
const initializeIo = (httpSever) => {
    io = new socket_io_1.Server(httpSever, {
        cors: { origin: "*" },
    });
    io.use(async (socket, next) => {
        try {
            const { user, decoded } = await (0, token_security_1.decodeToken)({ authorization: socket.handshake?.auth.authorization || "", tokenType: token_security_1.tokenTypeEnum.access });
            const userTaps = exports.connectedSockets.get(user._id.toString()) || [];
            userTaps?.push(socket.id);
            exports.connectedSockets.set(user._id.toString(), userTaps);
            console.log(exports.connectedSockets);
            socket.credentials = { user, decoded };
            next();
        }
        catch (error) {
            next(error);
        }
    });
    function disconnectSocket(socket) {
        return socket.on("disconnect", () => {
            const userId = socket.credentials?.user._id?.toString();
            if (exports.connectedSockets.has(userId)) {
                const sockets = exports.connectedSockets.get(userId).filter(id => id !== socket.id);
                if (sockets.length > 0) {
                    exports.connectedSockets.set(userId, sockets);
                }
                else {
                    exports.connectedSockets.delete(userId);
                }
            }
            io.emit("user_offline", { userId: socket.credentials?.user._id?.toString() });
            console.log(`offline socket: ${socket.id}`);
            console.log({ after_disconnect: exports.connectedSockets });
        });
    }
    const chatGateWay = new chat_1.ChatGateWay();
    io.on("connection", (socket) => {
        console.log("new socket connected", socket.credentials?.user._id?.toString());
        console.log("connectedSockets", exports.connectedSockets);
        console.log(exports.connectedSockets.get(socket.credentials?.user._id?.toString()));
        io.emit("user_online", { userId: socket.credentials?.user._id?.toString() });
        chatGateWay.register(socket, (0, exports.getIo)());
        disconnectSocket(socket);
    });
};
exports.initializeIo = initializeIo;
const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    ;
    return io;
};
exports.getIo = getIo;
