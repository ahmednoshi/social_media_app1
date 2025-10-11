import {Server as HttpServer}  from "node:http";
import { Server } from "socket.io";
import { decodeToken , tokenTypeEnum } from "../../utils/security/token.security";
import { IAuthSocket } from "./gatway.interface";
import { ChatGateWay } from './../chat/chat';

export const connectedSockets= new Map<string,string[]>() ;
let io : Server<IAuthSocket> | undefined = undefined;


export const initializeIo = ( httpSever:HttpServer)=>{
    io = new Server<IAuthSocket>(httpSever,{
        cors:{ origin:"*" },
    })

    io.use(async (socket: IAuthSocket,next) =>{
        try {
            const {user , decoded} = await decodeToken({authorization:socket.handshake?.auth.authorization || "",tokenType:tokenTypeEnum.access});

            const userTaps =connectedSockets.get(user._id.toString()) || [] 
            userTaps?.push(socket.id) ;            
            connectedSockets.set(user._id.toString(),userTaps ) ; 
            console.log(connectedSockets);
            
            socket.credentials = {user,decoded};
            next();
        }
        catch (error: any) {
            next(error);
        }
    });


    function disconnectSocket(socket: IAuthSocket) {
  return socket.on("disconnect", () => {
    const userId = socket.credentials?.user._id?.toString() as string;

    if (connectedSockets.has(userId)) {
      const sockets = connectedSockets.get(userId)!.filter(id => id !== socket.id);

      if (sockets.length > 0) {
        connectedSockets.set(userId, sockets); // still has other connections
      } else {
        connectedSockets.delete(userId); // no more connections
        socket.broadcast.emit("offline_user", userId);
      }
    }

    console.log(`offline socket: ${socket.id}`);
    console.log({ after_disconnect: connectedSockets });
  });
}



    const chatGateWay = new ChatGateWay();

    io.on("connection",(socket:IAuthSocket)=>{
        console.log("new socket connected",socket.credentials?.user._id?.toString());
        console.log( "connectedSockets",connectedSockets);
        console.log( 
            connectedSockets.get(socket.credentials?.user._id?.toString() as string)
        );

        chatGateWay.register(socket , getIo());

        disconnectSocket(socket);

    });

    }


export const getIo = ()=>{
    if(!io) {throw new Error("Socket.io not initialized")};
    return io;
    }
