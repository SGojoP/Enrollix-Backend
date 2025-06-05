import { sendMail } from "./utils/mailer.js";

const test = async () => {
    try {
        await sendMail("freeitup22@gmail.com", "Test Email", "Hello! This is a test, sent in order to check the email working properly.");
        console.log("✅ Test email sent successfully!");
    } catch (error) {
        console.error("❌ Test email failed:", error);
    }
};

test();