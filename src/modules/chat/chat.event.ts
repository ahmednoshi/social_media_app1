import { Server } from "socket.io";
import { IAuthSocket } from "../gateway/gatway.interface";
import { CahtService } from "./chat.service";

export class ChatEvent {
    private chatService = new CahtService();
    constructor(){}


    sayHi = (socket:IAuthSocket)=>{
            socket.on("sayHi",(date , callback)=>{
                this.chatService.sayHi({message:date , socket , callback});
            });}
        



        sendMessage = (socket:IAuthSocket)=>{
            return socket.on("sendMessage",(data:{contnet:string;sendTo:string})=>{
            return this.chatService.sendMessage({...data , socket});
        })
    }
        

    joinRoom = (socket:IAuthSocket , io:Server)=>{
        socket.on("join_room" , (data:{roomId:string})=>{
           return this.chatService.joinRoom({...data , socket , io});
        })
    }

    sendGroupMessage = (socket:IAuthSocket , io:Server)=>{
        socket.on("sendGroupMessage" , (data:{contnet:string;groupId:string;})=>{
           return this.chatService.sendGroupMessage({...data , socket , io});
        })
    }


    typing = (socket:IAuthSocket,io:Server)=>{
        socket.on("typing" , (data:{sendTo:string})=>{
            return this.chatService.typing({...data , socket , io});
        })
    }


    stopTyping = (socket:IAuthSocket,io:Server)=>{
        socket.on("stopTyping" , (data:{sendTo:string})=>{
            return this.chatService.stopTyping({...data , socket , io});
        })
    }


    
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
}