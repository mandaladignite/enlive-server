import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"]
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: [true, "Service ID is required"]
    },
    stylistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stylist",
        required: false // Optional as per requirements
    },
    date: {
        type: Date,
        required: [true, "Appointment date is required"],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: "Appointment date must be in the future"
        }
    },
    timeSlot: {
        type: String,
        required: [true, "Time slot is required"],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"]
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        enum: ["home", "salon"],
        default: "salon"
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"],
        default: "pending"
    },
    notes: {
        type: String,
        trim: true,
        maxLength: [500, "Notes cannot exceed 500 characters"]
    },
    totalPrice: {
        type: Number,
        required: [true, "Total price is required"],
        min: [0, "Price cannot be negative"]
    },
    address: {
        street: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        zipCode: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true,
            default: "India"
        }
    },
    cancellationReason: {
        type: String,
        trim: true,
        maxLength: [200, "Cancellation reason cannot exceed 200 characters"]
    },
    cancelledAt: {
        type: Date
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ stylistId: 1, date: 1, timeSlot: 1 });
appointmentSchema.index({ date: 1, status: 1 });

// Virtual for checking if appointment is in the past
appointmentSchema.virtual('isPast').get(function() {
    const appointmentDateTime = new Date(`${this.date.toDateString()} ${this.timeSlot}`);
    return appointmentDateTime < new Date();
});

// Virtual for checking if appointment can be cancelled (at least 2 hours before)
appointmentSchema.virtual('canBeCancelled').get(function() {
    const appointmentDateTime = new Date(`${this.date.toDateString()} ${this.timeSlot}`);
    const twoHoursBefore = new Date(appointmentDateTime.getTime() - (2 * 60 * 60 * 1000));
    return new Date() < twoHoursBefore && this.status !== 'cancelled' && this.status !== 'completed';
});

// Pre-save middleware to validate stylist availability
appointmentSchema.pre('save', async function(next) {
    if (this.isNew && this.stylistId) {
        const stylist = await mongoose.model('Stylist').findById(this.stylistId);
        if (!stylist || !stylist.isActive) {
            return next(new Error('Selected stylist is not available'));
        }
        
        // Check if stylist works on the appointment day
        const dayOfWeek = this.date.toLocaleDateString('en-US', { weekday: 'lowercase' });
        if (!stylist.workingDays.includes(dayOfWeek)) {
            return next(new Error('Stylist is not available on this day'));
        }
        
        // Check if appointment time is within stylist's working hours
        const appointmentTime = this.timeSlot;
        if (appointmentTime < stylist.workingHours.start || appointmentTime > stylist.workingHours.end) {
            return next(new Error('Appointment time is outside stylist working hours'));
        }
    }
    next();
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);
