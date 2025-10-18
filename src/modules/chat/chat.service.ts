import type { Request ,Response } from "express";
import { ChatRepositry } from "../../DB/repositry/chat.repositry";
import { ChatModel } from "../../DB/models/chat.model";
import { Types } from "mongoose";
import { AppError } from "../../utils/response/app.Error";
import { DatabaseRepositry } from "../../DB/repositry/database.repositry";
import { connectedSockets, getIo } from "../gateway/getway";
import { deleteFiles, uploadFile } from "../../utils/aws/s3.config";
import {v4 as uuid} from "uuid"
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

    
        const senderSockets = connectedSockets.get(createBy.toString());
        if (senderSockets?.length) {
  senderSockets.forEach(socketId => {
    getIo().to(socketId).emit("successMessage", { content, sendTo });
  });
}


        const receiverSockets = connectedSockets.get(sendTo);
        if (receiverSockets?.length) {
  receiverSockets.forEach(socketId => {
    getIo().to(socketId).emit("newMessage", {
      content,
      from: socket.credentials?.user
    });
  });
}


  } catch (error: any) {
    socket.emit("custom_error", { message: error.message || "Server Error" });
  }
    };




    createGroup = async (req:Request,res:Response):Promise<Response>=>{

      const {group,participants} = req.body;
      const dbparticipants = participants.map((participant:string)=>{return Types.ObjectId.createFromHexString(participant)})

      const user = await this.userModel.find({
        filter:{_id:{$in:dbparticipants},friends:{$in:[req.user?._id as Types.ObjectId]}},
      });

      // if(participants.length != user.length) throw new AppError("You can not create group with this participants",400);

      let group_image:string | undefined = undefined
      const roomId = group.replaceAll(/\s+/g,"_")+"_"+uuid();

      if(req.file){
        group_image = await uploadFile({file:req.file as Express.Multer.File,path:`/chat/group/${roomId}`});
      }

      dbparticipants.push(req.user?._id as Types.ObjectId)
      const [newGroup] = await this.chatModel.create({data:[{
        createBy:req.user?._id as Types.ObjectId,
        group,
        groupImage:group_image as string,
        roomId,
        participants:dbparticipants,
        messages:[]

      }]
      }) || [];

      if(!newGroup) {
        if(group_image){
          await deleteFiles({urls:[group_image]});
        }
        throw new AppError("Failed to create group",500);
      }
      
      return res.status(201).json({
        message: "Group created",
        success: true,
        data: { group:newGroup }
    });
    
    }




    getGroupChat = async (req:Request,res:Response):Promise<Response>=>{
     
        const {groupId} = req.params;
        const chat = await this.chatModel.findOne({
            filter:{
              group:{ $exists: true },
              _id:Types.ObjectId.createFromHexString(groupId as unknown as string),
              participants:{$in:[req.user?._id as Types.ObjectId]},
            },

            options:{populate:{path:"messages.createBy",select:"userName email groupImage firstName lastName gender"}},
        });



            // if(!chat) throw new AppError("No chat found",404);


        return res.status(200).json({
        message: chat ? "Chat found" : "No chat found yet",
        success: true,
        data: { chat: chat || null }
    });
    }


      joinRoom = async ({ roomId, socket, io  }: any) => {
      try {
        const chat = await this.chatModel.findOne({
          filter: {
            roomId,
            group: { $exists: true },
            participants:{$in:[socket.credentials?.user._id ]},
          }
        });

        
        

        if (!chat) throw new AppError("Chat not found", 404);

        
        socket.join(chat.roomId as string);
        
    


  } catch (error: any) {
    socket.emit("custom_error", { message: error.message || "Server Error" });
  }
    };



    sendGroupMessage = async ({ content, groupId, socket, io  }: any) => {
  try {
    const createBy = socket.credentials?.user._id as Types.ObjectId;

    let chat = await this.chatModel.findOneAndUpdate({
      filter: {
        _id: Types.ObjectId.createFromHexString(groupId), 
        participants: {$in:[createBy]},
        group: { $exists: true },
      },
      update: {
        $push: { messages: { content,  createBy } }
      },
      options: { new: true } 
    });

    if (!chat) {
      if (!chat) throw new AppError("falid find match caht", 500);
    }

    
        const senderSockets = connectedSockets.get(createBy.toString());
        if (senderSockets?.length) {
  senderSockets.forEach(socketId => {
    getIo().to(socketId).emit("successMessage", { content, from: socket.credentials?.user });
  });
}


        const receiverSockets = connectedSockets.get(chat.roomId as string);
        if (receiverSockets?.length) {
  receiverSockets.forEach(socketId => {
    socket.to(socketId).emit("newMessage", {
      content,
      from: socket.credentials?.user,
      groupId
    });
  });
}

  } catch (error: any) {
    socket.emit("custom_error", { message: error.message || "Server Error" });
  }
    };


    typing = async ({ sendTo, socket, io }: any) => {
  const senderId = socket.credentials?.user._id.toString();
  const receiverSockets = connectedSockets.get(sendTo);
  if (receiverSockets?.length) {
    receiverSockets.forEach(socketId => {
      getIo().to(socketId).emit("typing", { from: {
        _id:senderId ,
        firstName : `${socket.credentials?.user.firstName} ${socket.credentials?.user.lastName}`,

      } });
    });
  }
};

    stopTyping = async ({ sendTo, socket, io }: any) => {
  const senderId = socket.credentials?.user._id.toString();

  const receiverSockets = connectedSockets.get(sendTo);
  if (receiverSockets?.length) {
    receiverSockets.forEach(socketId => {
      getIo().to(socketId).emit("stopTyping", { from: {
        _id:senderId ,
        firstName:`${socket.credentials?.user.firstName} ${socket.credentials?.user.lastName}`
      } });
    });
  }
};





    


    }





    






