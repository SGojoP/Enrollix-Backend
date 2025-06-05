import mongoose from "mongoose";

const PendingSubscriberSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    states: { type: [String], required: true },
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24 hours
});

export default mongoose.model("PendingSubscriber", PendingSubscriberSchema);
