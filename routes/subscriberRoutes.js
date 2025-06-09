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


const generateVerificationEmail = (name, link) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #2b6cb0;">Welcome to Enrollix, ${name || "Student"}!</h2>
    <p style="font-size: 16px; color: #333;">
      Thanks for choosing our MBBS Notification Service. Please confirm your subscription by clicking the button below.
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${link}" style="background-color: #2b6cb0; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
        ✅ Verify Your Email
      </a>
    </div>
    <p style="font-size: 14px; color: #555;">
      If the button above doesn't work, copy and paste this link into your browser:<br/>
      <a href="${link}" style="color: #2b6cb0;">${link}</a>
    </p>
    <hr style="margin: 24px 0;" />
    <p style="font-size: 13px; color: #999;">
      This message was sent by Enrollix Notification System. <br/>
      Need help? Contact <a href="mailto:enrollix.official@gmail.com" style="color: #999;">support@getenrollix.com</a>
    </p>
  </div>
`

// Subscription route
router.post("/", async (req, res) => {
    const { emailOrPhone, states, name} = req.body;

    if (!emailOrPhone || !states?.length) {
        return res.status(400).json({ error: "Email/Phone and States are required." });
    }
    
    // Regex email format check
    const isValidEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    
    if (!isValidEmail(emailOrPhone)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
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
            const verificationLink = `${process.env.FRONTEND_URL}/Verify-email/${token}`;




            // Store pending subscriber
            await PendingSubscriber.create({ email: emailOrPhone, states, token, name });

            // Send verification email
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: emailOrPhone,
              subject: "Verify Your Subscription",
              html: generateVerificationEmail(name, verificationLink)
            })

            return res.json({ message: "Verification email sent. Please check your inbox." });
        } else {
            return res.status(400).json({ error: "Only email-based subscriptions require verification." });
        }

    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

export default router;