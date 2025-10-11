import { IAuthSocket } from "../gateway/gatway.interface";
import { CahtService } from "./chat.service";

export class ChatEvent {
    private chatService = new CahtService();
    constructor(){}


    sayHi = (socket:IAuthSocket)=>{
            socket.on("say_hi",(date , callback)=>{
                this.chatService.sayHi({message:date , socket , callback});
            });}
        



        sendMessage = (socket:IAuthSocket)=>{
            return socket.on("sendMessage",(data:{contnet:string;sendTo:string})=>{
            return this.chatService.sendMessage({...data , socket,});
        })
    }
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
}