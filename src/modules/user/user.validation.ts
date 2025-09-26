import {z} from "zod";


export const signUp={
    body:z.object({
        firstName:z.string({error:"first name is required"}).min(3,{error:"first name must be at least 3 characters"}).max(30),
        lastName:z.string({error:"last name is required"}),
        email:z.string().email({error:"valid email is required"}),
        password:z.string({error:"password is required"}).min(6,{error:"password must be at least 6 characters"}).max(20),
        confirmPassword:z.string({error:"confirm password is required"}).min(6,{error:"password must be at least 6 characters"}).max(20),   
}).refine((data)=>{
        return data.password === data.confirmPassword
    },{
        error:"passwords do not match",
        path:["confirmPassword"]
    })

}
