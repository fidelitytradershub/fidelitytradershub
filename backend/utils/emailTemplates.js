import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const currentYear = new Date().getFullYear();

// Single transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.VERIFICATION_EMAIL,
    pass: process.env.VERIFICATION_PASS,
  },
});

export const emailTemplates = {
  verificationEmail: async (username, verifyLink) => {
    return {
      transporter,
      from: '"FidelityTradersHub" <fidelitytradershub@gmail.com>',
      subject: "Verify Your FidelityTradersHub Account",
      text: `Hello ${username},\n\nPlease verify your email: ${verifyLink}\n\nLink expires in 24 hours.`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email - FidelityTradersHub</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Orbitron', -apple-system, BlinkMacOSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0E1A1F;
      color: #FFFFFF;
      line-height: 1.6;
    }
    .container {
      max-width: 580px;
      margin: 32px auto;
      background: #121F25;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid rgba(105, 103, 251, 0.12);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .header {
      background: linear-gradient(135deg, #6967FB 0%, #4F4CDB 100%);
      padding: 48px 32px 40px;
      text-align: center;
    }
    .logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 24px;
    }
    .content {
      padding: 40px 32px;
      text-align: center;
    }
    .title {
      font-family: 'Orbitron', sans-serif;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #FFFFFF;
      letter-spacing: 1px;
    }
    .greeting {
      font-family: 'Orbitron', sans-serif;
      font-size: 18px;
      margin-bottom: 24px;
      color: #C8F904;
      font-weight: 600;
    }
    .text {
      font-size: 16px;
      color: #D1D5DB;
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      background: #6967FB;
      color: #FFFFFF !important;
      font-family: 'Orbitron', sans-serif;
      font-size: 18px;
      font-weight: 600;
      padding: 16px 48px;
      border-radius: 50px;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 8px 24px rgba(105, 103, 251, 0.35);
      margin: 8px 0 32px;
      letter-spacing: 0.5px;
    }
    .button:hover {
      background: #5753E6;
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(105, 103, 251, 0.45);
    }
    .footer {
      background: #0A1318;
      padding: 32px;
      text-align: center;
      font-size: 14px;
      color: #9CA3AF;
      border-top: 1px solid rgba(105, 103, 251, 0.08);
    }
    .social-links a {
      margin: 0 12px;
      display: inline-block;
    }
    .social-icon {
      width: 28px;
      height: 28px;
      filter: brightness(1.2);
    }
    .highlight {
      color: #C8F904;
      font-weight: 600;
      font-family: 'Orbitron', sans-serif;
    }
    @media (max-width: 600px) {
      .container { margin: 16px; border-radius: 16px; }
      .header { padding: 40px 24px 32px; }
      .content { padding: 32px 24px; }
      .title { font-size: 24px; }
      .button { padding: 14px 40px; font-size: 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img 
        src="https://res.cloudinary.com/dy4tmq3gh/image/upload/v1770742965/L4_bj9bxj.png" 
        alt="fidelitytradershub Logo" 
        class="logo"
      />
    </div>

    <div class="content">
      <h1 class="title">Verify Your Email</h1>
      <div class="greeting">Hey ${username}, welcome to FidelityTradersHub! 🚀</div>
      
      <p class="text">
        Just one quick step left — please verify your email address to activate your account as an Admin.
      </p>

      <a href="${verifyLink}" target="_blank" class="button">
        Verify Email Now
      </a>

      <p class="text" style="font-size:14px; color:#9CA3AF;">
        This link expires in <span class="highlight">24 hours</span>.<br>
        If you didn't sign up, you can safely ignore this email.
      </p>
    </div>

    <div class="footer">
      <p style="margin-bottom: 20px;">
        Need help? Reach us at <a href="mailto:fidelitytradershub@gmail.com" style="color:#C8F904; text-decoration:none;">fidelitytradershub@gmail.com</a>
      </p>

      <p style="margin-top: 24px; font-family: 'Orbitron', sans-serif;">
        © ${currentYear} FidelityTradersHub. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    };
  },

  passwordResetEmail: async (resetLink) => {
    return {
      transporter,
      from: '"FidelityTradersHub" <fidelitytradershub@gmail.com>',
      subject: "Reset Your FidelityTradersHub Password",
      text: `Reset your password here: ${resetLink}\n\nLink expires in 1 hour.`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password - FidelityTradersHub</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Orbitron', -apple-system, BlinkMacOSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0E1A1F;
      color: #FFFFFF;
      line-height: 1.6;
    }
    .container { max-width: 580px; margin: 32px auto; background: #121F25; border-radius: 24px; overflow: hidden; border: 1px solid rgba(105, 103, 251, 0.12); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .header { background: linear-gradient(135deg, #6967FB 0%, #4F4CDB 100%); padding: 48px 32px 40px; text-align: center; }
    .logo { max-width: 180px; height: auto; margin-bottom: 24px; }
    .content { padding: 40px 32px; text-align: center; }
    .title { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 16px; color: #FFFFFF; letter-spacing: 1px; }
    .greeting { font-family: 'Orbitron', sans-serif; font-size: 18px; margin-bottom: 24px; color: #C8F904; font-weight: 600; }
    .text { font-size: 16px; color: #D1D5DB; margin-bottom: 32px; }
    .button { display: inline-block; background: #6967FB; color: #FFFFFF !important; font-family: 'Orbitron', sans-serif; font-size: 18px; font-weight: 600; padding: 16px 48px; border-radius: 50px; text-decoration: none; box-shadow: 0 8px 24px rgba(105, 103, 251, 0.35); margin: 8px 0 32px; transition: all 0.3s ease; letter-spacing: 0.5px; }
    .button:hover { background: #5753E6; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(105, 103, 251, 0.45); }
    .footer { background: #0A1318; padding: 32px; text-align: center; font-size: 14px; color: #9CA3AF; border-top: 1px solid rgba(105, 103, 251, 0.08); }
    .social-links a { margin: 0 12px; display: inline-block; }
    .social-icon { width: 28px; height: 28px; filter: brightness(1.2); }
    .highlight { color: #C8F904; font-weight: 600; font-family: 'Orbitron', sans-serif; }
    @media (max-width: 600px) {
      .container { margin: 16px; border-radius: 16px; }
      .header { padding: 40px 24px 32px; }
      .content { padding: 32px 24px; }
      .title { font-size: 24px; }
      .button { padding: 14px 40px; font-size: 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img 
        src="https://res.cloudinary.com/dy4tmq3gh/image/upload/v1770742965/L4_bj9bxj.png" 
        alt="FidelityTradersHub Logo" 
        class="logo"
      />
    </div>

    <div class="content">
      <h1 class="title">Reset Your Password</h1>
      <div class="greeting">No stress — we've got you!</div>
      
      <p class="text">
        Click the button below to set a new password for your FidelityTradersHub account.
      </p>

      <a href="${resetLink}" target="_blank" class="button">
        Reset Password
      </a>

      <p class="text" style="font-size:14px; color:#9CA3AF;">
        This link expires in <span class="highlight">1 hour</span>.<br>
        If you didn't request this reset, ignore this email — your account is safe.
      </p>
    </div>

    <div class="footer">
      <p style="margin-bottom: 20px;">
        Questions? Hit us up: <a href="mailto:fidelitytradershub@gmail.com" style="color:#C8F904; text-decoration:none;">fidelitytradershub@gmail.com</a>
      </p>

      <p style="margin-top: 24px; font-family: 'Orbitron', sans-serif;">
        © ${currentYear} FidelityTradersHub. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    };
  },
};