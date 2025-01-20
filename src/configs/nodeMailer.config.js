import env from "#configs/env";
import nodemailer from "nodemailer";

export const sendEmail = async (mailOptions) => {
  try {
    // Create a transporter

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
