import express from "express";
import Subscriber from "../models/Subscriber.js"; // Import the Subscriber model

const router = express.Router();

// Unsubscribe API
router.post("/unsubscribe", async (req, res) => {
  try {
    const { contact, states } = req.body;

    if (!contact) {
      return res.status(400).json({ error: "Contact is required." });
    }

    const subscriber = await Subscriber.findOne({ emailOrPhone: contact });

    if (!subscriber) {
      return res.status(404).json({ error: "Subscriber not found." });
    }

    if (states?.length) {
      // Remove only selected states
      subscriber.states = subscriber.states.filter((s) => !states.includes(s));

      if (subscriber.states.length === 0) {
        await Subscriber.deleteOne({ _id: subscriber._id }); // Delete if no states left
        return res.json({ message: "Unsubscribed completely." });
      } else {
        await subscriber.save();
        return res.json({ message: "Unsubscribed from selected states." });
      }
    } else {
      // Unsubscribe completely
      await Subscriber.deleteOne({ _id: subscriber._id });
      return res.json({ message: "Unsubscribed completely." });
    }
  } catch (error) {
    console.error("Unsubscribe Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
