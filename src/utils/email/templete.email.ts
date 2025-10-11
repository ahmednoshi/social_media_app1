
export const verifyEmailTemplate = ({title,otp}:{title:string,otp:number | string}):string=>{

    return  ` <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 480px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        padding: 24px;
        text-align: center;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
      .content {
        padding: 32px 24px;
        text-align: center;
      }
      .content p {
        font-size: 15px;
        color: #555555;
        margin-bottom: 24px;
      }
      .otp-box {
        display: inline-block;
        font-size: 28px;
        letter-spacing: 8px;
        font-weight: bold;
        color: #111827;
        background: #f3f4f6;
        padding: 14px 20px;
        border-radius: 12px;
        margin-bottom: 24px;
      }
      .footer {
        font-size: 12px;
        color: #9ca3af;
        padding: 16px;
        text-align: center;
        background: #f9fafb;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${title}</h1>
      </div>
      <div class="content">
        <p>Use the OTP below to verify your email:</p>
        <div class="otp-box">${otp}</div>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} megaSocial. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}



export const mentionEmailTemplate = ({
  title,
  mentionedBy,
  postContent,
  postLink
}: {
  title: string,
  mentionedBy: string,
  postContent: string,
  postLink: string
}): string => {

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 480px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        padding: 24px;
        text-align: center;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
      .content {
        padding: 32px 24px;
        text-align: left;
      }
      .content p {
        font-size: 15px;
        color: #555555;
        margin-bottom: 16px;
      }
      .post-preview {
        background: #f3f4f6;
        padding: 12px 16px;
        border-left: 4px solid #4f46e5;
        border-radius: 8px;
        font-style: italic;
        color: #374151;
        margin-bottom: 24px;
      }
      .btn {
        display: inline-block;
        padding: 12px 20px;
        background: #4f46e5;
        color: #ffffff;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 500;
      }
      .footer {
        font-size: 12px;
        color: #9ca3af;
        padding: 16px;
        text-align: center;
        background: #f9fafb;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${title}</h1>
      </div>
      <div class="content">
        <p><strong>${mentionedBy}</strong> mentioned you in a post:</p>
        <div class="post-preview">
          ${postContent.substring(0, 120)}...
        </div>
        <a href="${postLink}" class="btn">View Post</a>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} megaSocial. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};
