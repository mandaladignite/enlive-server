import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.route.js"
import appointmentRoutes from "./routes/appointment.route.js"
import serviceRoutes from "./routes/service.route.js"
import stylistRoutes from "./routes/stylist.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import orderRoutes from "./routes/order.route.js"
import packageRoutes from "./routes/package.route.js"
import membershipRoutes from "./routes/membership.route.js"
import profileRoutes from "./routes/profile.route.js"
import addressRoutes from "./routes/address.route.js"
import galleryRoutes from "./routes/gallery.route.js"
import whatsappRoutes from "./routes/whatsapp.route.js"
import reviewRoutes from "./routes/review.route.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Routes
app.use("/auth", authRoutes)
app.use("/appointments", appointmentRoutes)
app.use("/services", serviceRoutes)
app.use("/stylists", stylistRoutes)
app.use("/products", productRoutes)
app.use("/cart", cartRoutes)
app.use("/orders", orderRoutes)
app.use("/packages", packageRoutes)
app.use("/memberships", membershipRoutes)
app.use("/profile", profileRoutes)
app.use("/addresses", addressRoutes)
app.use("/gallery", galleryRoutes)
app.use("/whatsapp", whatsappRoutes)
app.use("/reviews", reviewRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString()
    })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    })
})

export {app}