"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = require("nodemailer");
const app_Error_1 = require("../response/app.Error");
const sendEmail = async (data) => {
    if (!data.html && !data.attachments?.length && !data.text) {
        throw new app_Error_1.AppError("email content is required", 400);
    }
    const transporter = (0, nodemailer_1.createTransport)({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    const info = await transporter.sendMail({
        ...data,
        from: `Social Media App <${process.env.EMAIL} >`,
    });
    console.log("Message sent:", info.messageId);
};
exports.sendEmail = sendEmail;
