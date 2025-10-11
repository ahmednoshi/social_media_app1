import { Server, Socket } from "socket.io";

export interface idSendMessageDto{
    content:string;
    sendTo:string;
    socket:Socket;
    io:Server;
}