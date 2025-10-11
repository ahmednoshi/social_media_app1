import { Server } from "socket.io";
import { IAuthSocket } from "../gateway/gatway.interface";
import { ChatEvent } from './chat.event';

export  class ChatGateWay {
    private chatEvent:ChatEvent = new ChatEvent();
    constructor(){}

    register = (socket:IAuthSocket , io:Server)=>{
        this.chatEvent.sayHi(socket);
        this.chatEvent.sendMessage(socket);
        
    }

}