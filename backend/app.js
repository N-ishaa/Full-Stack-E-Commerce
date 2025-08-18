import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';

const app = express()

const corsOptions = {
    origin: [
        process.env.CORS_ORIGIN || "http://localhost:3000",
       "https://full-stack-e-commerce-jade.vercel.app", // Your Vercel URL" // If you have a custom domain
    ],
    credentials: true, // Important for cookies/auth
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control']
}

// Apply CORS middleware BEFORE routes
app.use(cors(corsOptions))

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions))

// Add logging to debug CORS
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`)
    next()
})
// Handle preflight requests explicitly
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))


app.use("/api",router)
export {app} ;