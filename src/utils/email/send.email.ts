import {createTransport, type Transporter } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { AppError } from '../response/app.Error';


export  const sendEmail = async( data:Mail.Options):Promise<void>=>{

    if(!data.html && !data.attachments?.length  && !data.text){
        throw new AppError("email content is required",400);
    }

    const transporter:Transporter<SMTPTransport.SentMessageInfo> = createTransport({
        service:"gmail",
        auth: {
            user:process.env.EMAIL as string,
            pass:process.env.EMAIL_PASSWORD as string
        }
    })

    const info = await transporter.sendMail({
    ...data,
    from: `Confrimation Email For Social Media App <${process.env.EMAIL as string } >`,
   
  });

  console.log("Message sent:", info.messageId);







}


