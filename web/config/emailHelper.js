import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();


// SMTP function to send email
const sendEmail = async (to,from, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAILHOST,
    port: process.env.EMAILPORT, // or 465 for SSL
    secure: false, // true for port 465, false for 587
    auth: {
      user: process.env.EMAILUSER,  // Replace with your email
      pass: process.env.EMAILPASS    // Replace with your email password or app password
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 5000, // 5 seconds
  });

  const mailOptions = {
    from: process.env.EMAILUSER,
    to: to,
    replyTo: from,
    subject: subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};

// module.exports = sendEmail;
export default sendEmail; // Use ES module export
