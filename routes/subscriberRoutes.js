// import express from "express";
// import Subscriber from "../models/Subscriber.js";

// const router = express.Router();

// // Subscribe a new user
// router.post("/subscribe", async (req, res) => {
//   try {
//     const { emailOrPhone, states } = req.body;

//     if (!emailOrPhone || !states || states.length === 0) {
//       return res.status(400).json({ message: "Email/Phone and states are required" });
//     }

//     const subscriber = new Subscriber({ emailOrPhone, states });
//     await subscriber.save();

//     res.status(201).json({ message: "Subscribed successfully!" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// router.get("/state/:state", async (req, res) => {
//     try {
//       const state = req.params.state;
//       const subscribers = await Subscriber.find({ states: state });
//       res.json(subscribers);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });


// export default router;


import express from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import PendingSubscriber from "../models/PendingSubscriber.js";
import dotenv from "dotenv";
import Subscriber from "../models/Subscriber.js"; 

dotenv.config();
const router = express.Router();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// Subscription route
router.post("/", async (req, res) => {
    const { emailOrPhone, states, name} = req.body;

    if (!emailOrPhone || !states?.length) {
        return res.status(400).json({ error: "Email/Phone and States are required." });
    }

    try {
        if (emailOrPhone.includes("@")) {

            const existingSub = await Subscriber.findOne({ emailOrPhone });
            if (existingSub) {
                return res.status(400).json({ error: "Email is already subscribed." });
            }

            // **Check if already pending**
            const existingPending = await PendingSubscriber.findOne({ email: emailOrPhone });
            if (existingPending) {
                return res.status(400).json({ error: "A verification email was already sent." });
            }


            // Email subscription requires verification
            const token = crypto.randomBytes(32).toString("hex");
            // const verificationLink = `${process.env.FRONTEND_URL}/#/verify-email?token=${token}`;
            const verificationLink = `${process.env.FRONTEND_URL}/#/verify-email/${token}`;




            // Store pending subscriber
            await PendingSubscriber.create({ email: emailOrPhone, states, token, name });

            // Send verification email
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: emailOrPhone,
                subject: "Verify Your Subscription",
                text: `Thankyou for choosing our notification service \n Please click The Link To verify it's you. \n ${verificationLink}`
            });

            return res.json({ message: "Verification email sent. Please check your inbox." });
        } else {
            return res.status(400).json({ error: "Only email-based subscriptions require verification." });
        }

    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

export default router;