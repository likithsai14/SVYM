const sgMail = require("@sendgrid/mail");

// Set SendGrid API Key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async function(event, context) {
  try {
    const { to, subject, message } = JSON.parse(event.body);

    const msg = {
      to,
      from: {
        email: process.env.SENDER_MAIL,
        name: "SVYM Tech4Hope"
      }, // verified sender
      subject,
      text: message,
    };

    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Email sent successfully!" }),
    };
  } catch (error) {
    console.error("SendGrid error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message }),
    };
  }
};
