const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

async function sendOtpSMS(phoneNumber, message) {
    try {
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });
        console.log(`SMS sent to ${phoneNumber}`);
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
}

module.exports = { sendOtpSMS };
