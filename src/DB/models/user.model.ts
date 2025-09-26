import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import emailEvent from "../../utils/event/email.event";
import { generateHash } from "../../utils/security/hash.security";

export enum GenderEnum{
    male = "male",
    female = "female",
}

export enum RoleEnum{
    user = "user",
    admin = "admin",
}



export interface IUser {
    firstName:string;
    lastName:string;
    username?:string;

    email:string;
    confirmEmailOtp?:string;
    confirmAT?:string;

    password:string;
    confirmPassword?:string;
    resetPasswordOtp?:string;
    changeCredentialTime?:Date;

    phonne?:string;
    adress?:string;

    gender:GenderEnum;


    friends?:Types.ObjectId[];
    

    role:RoleEnum;
    age?:number;

    freezeAT?:boolean;
    freezeBy?:Types.ObjectId;


    createdAt:Date;
    updatedAt?:Date;
    
}


export const userSchema = new Schema<IUser>(
    {
    firstName:{type:String,required:true,minlength:3,maxlength:30},
    lastName:{type:String,required:true},

    email:{type:String,required:true,unique:true},
    confirmEmailOtp:{type:String},
    confirmAT:{type:String},

    password:{type:String,required:true},
    confirmPassword:{type:String},
    resetPasswordOtp:{type:String},
    changeCredentialTime:{type:Date},

    phonne:{type:String},
    adress:{type:String},

    friends:[{type:Schema.Types.ObjectId,ref:"User"}],

    gender:{type:String,enum:GenderEnum,default:GenderEnum.male},


    role:{type:String,enum:RoleEnum,default:RoleEnum.user},
    age:{type:Number},


    createdAt:{type:Date},
    updatedAt:{type:Date},

    freezeAT:{type:Boolean},
    freezeBy:{type:Schema.Types.ObjectId,ref:"User"},
    
    



},
{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    strictQuery:true
}

);


userSchema.virtual("username").set(function (value:string){
    const [firstName , lastName] = value.split(" ") || [];
    this.set({firstName,lastName,})
}).get(function (){
    return this.firstName + " " + this.lastName
})


userSchema.pre("save",async function(this:HUserDocument&{wasNew:boolean,confirmEmailOtpForHook?:string},next){
    this.wasNew = this.isNew;

    if(this.isModified("password")){
        this.password = await generateHash(this.password);
    }

    
    
    if(this.isModified("confirmEmailOtp")){
        console.log(this.confirmEmailOtpForHook);
        this.confirmEmailOtpForHook = this.confirmEmailOtp as string;
        console.log(this.confirmEmailOtpForHook);
        this.confirmEmailOtp = await generateHash(this.confirmEmailOtp as string);

    }

    next();

})


userSchema.post("save",async function(doc,next){
    const that = this as HUserDocument & {wasNew:boolean;confirmEmailOtpForHook?:string};

    if(that.wasNew&&that.confirmEmailOtpForHook){
        emailEvent.emit("confirmEmail",{to:this.email,otp:that.confirmEmailOtpForHook});
    }


    next();
})



userSchema.pre(["find","findOne"],function(next){
    const query = this.getQuery();

    if(query.paranoid===false){
       this.setQuery({...query});
    }else{
        this.setQuery({...query,freezeAT:{$exists:false}});
    }
    


    next();
})

export const UserModel = models.User || model<IUser>("User",userSchema);

export type HUserDocument = HydratedDocument<IUser>;

