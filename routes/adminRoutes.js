import express from "express";
import Subscriber from "../models/Subscriber.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Get total subscribers and state-wise distribution
router.get("/subscribers/stats", async (req, res) => {
    try {
        const totalSubscribers = await Subscriber.countDocuments();

        const stateStats = await Subscriber.aggregate([
            { $unwind: "$states" },
            { $group: { _id: "$states", count: { $sum: 1 } } },
            { $project: { state: "$_id", count: 1, _id: 0 } }
        ]);

        res.json({ totalSubscribers, stateStats });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

export default router;