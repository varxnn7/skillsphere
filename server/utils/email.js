const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if email details are mock
  const isMock = 
    !process.env.EMAIL_USER || 
    process.env.EMAIL_USER === 'example@gmail.com' ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS === 'example_password';

  if (isMock) {
    console.log('--- EMAIL SEND SIMULATION ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.message}`);
    console.log('-----------------------------');
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"SkillSphere" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email send failure: ${error.message}`);
    throw error;
  }
};

module.exports = sendEmail;
