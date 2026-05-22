export function validateSendMessage(phone: string, message: string) {
  if (!phone) {
    throw new Error("Phone is required");
  }

  if (!message) {
    throw new Error("Message is required");
  }

  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length < 10) {
    throw new Error("Invalid phone number");
  }

  return {
    phone: cleanPhone,
    message: message.trim(),
  };
}
