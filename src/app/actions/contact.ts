"use server";

export async function sendEmail(formData: FormData) {
  const fullname = formData.get("fullname");
  const email = formData.get("email");
  const message = formData.get("message");

  if (!fullname || !email || !message) {
    return { error: "All fields are required." };
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const userId = process.env.EMAILJS_USER_ID; // Public key
  const accessToken = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !userId) {
    return { error: "Email service is not configured on the server." };
  }

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: userId,
        accessToken: accessToken,
        template_params: {
          from_name: fullname,
          from_email: email,
          message: message,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { error: `Failed to send email: ${text}` };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "An unexpected error occurred." };
  }
}
