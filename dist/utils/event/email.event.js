"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_stream_1 = require("node:stream");
const send_email_1 = require("../email/send.email");
const templete_email_1 = require("../email/templete.email");
exports.emailEvent = new node_stream_1.EventEmitter();
exports.emailEvent.on("confirmEmail", async (data) => {
    try {
        data.subject = "confirm your email";
        data.html = (0, templete_email_1.verifyEmailTemplate)({ title: "confirm your email", otp: data.otp });
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.log("Failed to send email", error);
    }
});
exports.emailEvent.on("resetPassword", async (data) => {
    try {
        data.subject = "Rest-Account-Password";
        data.html = (0, templete_email_1.verifyEmailTemplate)({ title: "Rest-Account-Password", otp: data.otp });
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.log("Failed to send email", error);
    }
});
exports.emailEvent.on("some one mentioned you", async (data) => {
    try {
        data.subject = "Someone mentioned you!";
        data.html = (0, templete_email_1.mentionEmailTemplate)({
            title: "You were mentioned",
            mentionedBy: data.mentionedBy,
            postContent: data.postContent,
            postLink: data.postLink
        });
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.log("Failed to send email", error);
    }
});
exports.default = exports.emailEvent;
