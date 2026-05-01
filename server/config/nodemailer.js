import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.error("Mailtrap connection error:", error);
    } else {
        console.log("Mailtrap connection successful ✓");
    }
});

export default transporter;


