import type { Request ,Response } from "express";
import { ChatRepositry } from "../../DB/repositry/chat.repositry";
import { ChatModel } from "../../DB/models/chat.model";
import { Types } from "mongoose";
import { AppError } from "../../utils/response/app.Error";
import { DatabaseRepositry } from "../../DB/repositry/database.repositry";
import { connectedSockets } from "../gateway/getway";
export class CahtService {
    private chatModel = new ChatRepositry(ChatModel);
    private userModel = new DatabaseRepositry(ChatModel);

    constructor(){}


    getChat = async (req:Request,res:Response):Promise<Response>=>{

        const {userId} = req.params;
        const chat = await this.chatModel.findOne({
            filter:{
                participants:{
                    $all:[
                        req.user?._id as Types.ObjectId,
                        Types.ObjectId.createFromHexString(userId!) 
                    ]
                },
                group:{ $exists:false },
            },

            options:{populate:{path:"participants",select:"userName email profileImage firstName lastName gender"}},
        });



            // if(!chat) throw new AppError("No chat found",404);


        return res.status(200).json({
        message: chat ? "Chat found" : "No chat found yet",
        success: true,
        data: { chat: chat || null }
    });
    }


    sayHi=({message , socket , callback}:any)=>{
        console.log({message});

    callback?callback("hi from server") : undefined

    }


    sendMessage = async ({ content, sendTo, socket, io  }: any) => {
  try {
    const createBy = socket.credentials?.user._id as Types.ObjectId;

    const user = await this.userModel.findOne({
      filter: {
        _id: Types.ObjectId.createFromHexString(sendTo),
        friends: { $in: [createBy] }
      }
    });

    // if (!user) throw new AppError("You can not send message to this user", 400);

    let chat = await this.chatModel.findOneAndUpdate({
      filter: {
        participants: { $all: [createBy, Types.ObjectId.createFromHexString(sendTo)] },
        group: { $exists: false }
      },
      update: {
        $push: { messages: { content,  createBy } }
      },
      options: { new: true } 
    });

    if (!chat) {
      const [Newchat] = await this.chatModel.create({
        data: [{
          createBy,
          participants: [createBy, Types.ObjectId.createFromHexString(sendTo)],
          messages: [{ content, createBy }]
        }]
      })|| [];

      if (!Newchat) throw new AppError("Failed to create chat", 500);
    }

    io?.to(connectedSockets.get(createBy.toString())!).emit("successMessage", { content, sendTo });
    io?.to(connectedSockets.get(sendTo)).emit("newMessage", { content, from: socket.credentials?.user });

  } catch (error: any) {
    socket.emit("custom_error", { message: error.message || "Server Error" });
  }
    };





}
