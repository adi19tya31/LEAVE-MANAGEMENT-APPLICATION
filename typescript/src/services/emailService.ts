import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendPasswordResetOtp(
  email: string,
  otp: string,
): Promise<void> {
  await transporter.sendMail({
    from: `"Leave Management System" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "Password Reset OTP",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: auto;
        padding: 20px;
      ">
        <h2>Password Reset Request</h2>

        <p>You requested to reset your password.</p>

        <p>Your OTP is:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          padding: 15px;
          background: #f4f6fc;
          text-align: center;
          border-radius: 8px;
        ">
          ${otp}
        </div>

        <p style="margin-top: 20px;">
          This OTP will expire in <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request a password reset, please ignore this email.
        </p>
      </div>
    `,
  });
}