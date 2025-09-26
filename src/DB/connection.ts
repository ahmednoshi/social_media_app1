import { connect } from "mongoose";
import { UserModel } from "./models/user.model";




const connectionDB = async():Promise<void>=>{

    try {
        const result = await connect(process.env.MONGO_URI as string,{
            serverSelectionTimeoutMS:30000, 
        });
        await UserModel.syncIndexes();
        console.log(result.models);
        console.log("Database connected successfully ❤️  ❤️");
        
        
    } catch (error) {
        console.log("Database connection error",error);
        
    }

}


export default connectionDB