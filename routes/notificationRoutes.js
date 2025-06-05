// import express from "express";
// import multer from "multer";
// import nodemailer from "nodemailer";
// import Subscriber from "../models/Subscriber.js";
// import dotenv from "dotenv";

// dotenv.config();

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// const sendMail = async (to, subject, text, files) => {
//     let transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
//     });

//     let mailOptions = {
//         from: process.env.EMAIL_USER,
//         to,
//         subject,
//         text,
//     };

//     if (files && files.length > 0) {
//         mailOptions.attachments = files.map(file => ({
//             filename: file.originalname,
//             content: file.buffer
//         }));
//     }

//     await transporter.sendMail(mailOptions);
// };


// router.post("/send-notification", upload.array("file", 4), async (req, res) => {
//     const { states, message, link, subject } = req.body;
//     const files = req.files;

//     if (!states?.length || !message) {
//         return res.status(400).json({ error: "States and message are required." });
//     }

//     try {

//         const subscribers = await Subscriber.find({ states: { $in: states } });


//         if (!subscribers.length) {
//             return res.json({ message: "No subscribers found for the selected states." });
//         }

//         let emailNotifications = [];
//         let whatsappNotifications = [];

//         for (const sub of subscribers) {
//             if (sub.emailOrPhone.includes("@")) {
//                 emailNotifications.push(sendMail(sub.emailOrPhone, subject || "New Notification", `${message}\n\n${link || ""}`, files));
//             } else {
//                 whatsappNotifications.push({ phone: sub.emailOrPhone, message, link });
//             }
//         }

//         // Send all email notifications
//         await Promise.all(emailNotifications);

//         console.log("Pending WhatsApp Notifications:", whatsappNotifications);

//         res.json({ 
//             message: "Notifications sent successfully.", 
//             emailCount: emailNotifications.length, 
//             whatsappCount: whatsappNotifications.length 
//         });

//     } catch (error) {
//         res.status(500).json({ error: "Server error", details: error.message });
//     }
// });

// export default router;



import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import Subscriber from "../models/Subscriber.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const sendMail = async (to, subject, text, files) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    if (files && files.length > 0) {
        mailOptions.attachments = files.map(file => ({
            filename: file.originalname,
            content: file.buffer
        }));
    }

    await transporter.sendMail(mailOptions);
};

router.post("/send-notification", upload.array("file", 4), async (req, res) => {
    const { states, message, link, subject } = req.body;
    const files = req.files;

    if (!states?.length || !message) {
        return res.status(400).json({ error: "States and message are required." });
    }

    try {
        const subscribers = await Subscriber.find({ states: { $in: states } });

        if (!subscribers.length) {
            return res.json({ message: "No subscribers found for the selected states." });
        }

        let emailNotifications = [];
        let whatsappNotifications = [];

        for (const sub of subscribers) {
            if (sub.paymentStatus) {
                // Paid user: Always send notifications
                if (sub.emailOrPhone.includes("@")) {
                    emailNotifications.push(sendMail(sub.emailOrPhone, subject || "New Notification", `${message}\n\n${link || ""}`, files));
                } else {
                    whatsappNotifications.push({ phone: sub.emailOrPhone, message, link });
                }
                await Subscriber.updateOne({ _id: sub._id }, { $inc: { count: -1 } });

            } else if (sub.count > 0) {
                // Free user with remaining count: Send and decrement
                if (sub.emailOrPhone.includes("@")) {
                    emailNotifications.push(sendMail(sub.emailOrPhone, subject || "New Notification", `${message}\n\n${link || ""}`, files));
                } else {
                    whatsappNotifications.push({ phone: sub.emailOrPhone, message, link });
                }
                await Subscriber.updateOne({ _id: sub._id }, { $inc: { count: -1 } });

            } else {
                // Free user with no count left: Send payment message
                const paymentMessage = `New notification is available. To continue receiving updates, please subscribe.\n\nSubscribe Now: ${process.env.PAYMENT_LINK}`;
                if (sub.emailOrPhone.includes("@")) {
                    emailNotifications.push(sendMail(sub.emailOrPhone, "Subscription Required", paymentMessage, files));
                } else {
                    whatsappNotifications.push({ phone: sub.emailOrPhone, message: paymentMessage, link: process.env.PAYMENT_LINK });
                }
            }
        }

        // Send all email notifications
        await Promise.all(emailNotifications);

        console.log("Pending WhatsApp Notifications:", whatsappNotifications);

        res.json({ 
            message: "Notifications sent successfully.", 
            emailCount: emailNotifications.length, 
            whatsappCount: whatsappNotifications.length 
        });

    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

export default router;