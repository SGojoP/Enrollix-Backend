import express from "express";
import Subscriber from "../models/Subscriber.js";
import PendingSubscriber from "../models/PendingSubscriber.js";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import generateConfirmationEmailHTML from "../emailtemplate/confirmationemailtemplate.js";

dotenv.config();
const router = express.Router();

router.get("/:token", async (req, res) => {
    const { token } = req.params;
    console.log({ token });

    try {
        // Find pending subscriber
        const pendingSub = await PendingSubscriber.findOne({ token });
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        if (!pendingSub) {
            return res.status(400).json({ error: "Invalid or expired token." });
        }

        // Move to main subscribers collection
        await Subscriber.create({ emailOrPhone: pendingSub.email, states: pendingSub.states, name: pendingSub.name });
        
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: pendingSub.email,
            subject: `Subscription Confirmation`,
            html: generateConfirmationEmailHTML({
                name: pendingSub.name,
                freeCredits: 4,
                price: 499
            }),
            text: `Hi ${pendingSub.name},\nYou are successfully subscribed to Enrollix. You get 4 free notifications. ₹99/year after that.`
        });

        await transporter.sendMail({
            from: "prasoon81818@gmail.com",
            to: process.env.Email_user,
            subject: `You got a new subscriber`,
            text: `Badhai ho You have a new subscriber for the news letter conver them to your customer.`
        });


        await PendingSubscriber.deleteOne({ _id: pendingSub._id });



        return res.json({ message: "Subscription confirmed successfully!" });


    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

export default router;