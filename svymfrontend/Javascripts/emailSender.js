// emailSender.js
export async function sendEmail({ to, subject, message }) {
  try {
    const response = await fetch("/.netlify/functions/sendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, message }),
    });

    const data = await response.json();
    console.log("Send email response:", data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: error.message };
  }
}
