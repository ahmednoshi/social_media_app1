import {createTransport, type Transporter } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { AppError } from '../response/app.Error';
import sgMail from '@sendgrid/mail';



export  const sendEmail = async( data:Mail.Options):Promise<void>=>{

    if(!data.html && !data.attachments?.length  && !data.text){
        throw new AppError("email content is required",400);
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);


    const msg = {
    to: data.to,
    from:`Social Media App <${process.env.EMAILSendGrid as string } >`,// البريد المرسل verified في SendGrid
    subject: data.subject,
    text: data.text,
    html: data.html,
    attachments: data.attachments,
  };


   try {
    const response = await sgMail.send(msg as any);
    console.log("Email sent:", response[0].statusCode);
  } catch (error: any) {
    console.error("Error sending email:", error.response?.body || error.message);
    throw new AppError("Failed to send email", 500);
  }

  


//     const transporter:Transporter<SMTPTransport.SentMessageInfo> = createTransport({
//         service:"gmail",
//         auth: {
//             user:process.env.EMAIL as string,
//             pass:process.env.EMAIL_PASSWORD as string
//         }
//     })

//     const info = await transporter.sendMail({
//     ...data,
//     from: `Social Media App <${process.env.EMAIL as string } >`,
   
//   });

//   console.log("Message sent:", info.messageId);

}


