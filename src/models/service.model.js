import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Service name is required"],
        trim: true,
        maxLength: [100, "Service name cannot exceed 100 characters"]
    },
    description: {
        type: String,
        trim: true,
        maxLength: [500, "Description cannot exceed 500 characters"]
    },
    duration: {
        type: Number,
        required: [true, "Service duration is required"],
        min: [15, "Minimum duration is 15 minutes"],
        max: [480, "Maximum duration is 8 hours"]
    },
    price: {
        type: Number,
        required: [true, "Service price is required"],
        min: [0, "Price cannot be negative"]
    },
    category: {
        type: String,
        required: [true, "Service category is required"],
        enum: ["hair", "nails", "skincare", "massage", "makeup", "other"],
        default: "hair"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    availableAtHome: {
        type: Boolean,
        default: false
    },
    availableAtSalon: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const Service = mongoose.model("Service", serviceSchema);
