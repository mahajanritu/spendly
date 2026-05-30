const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_EMAIL,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });

  await transporter.sendMail({
    from: '"Spendly" <mahajanritu0801@gmail.com>',
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;