import cookieParser from "cookie-parser";
import cors from 'cors'
import express from "express";
import rateLimit from "express-rate-limit";
import session from "express-session";
import fs from 'fs'
import { createServer } from "http";
import { Server } from "socket.io";
import swaggerUi from 'swagger-ui-express'
import { initializeSocketIO } from "./socket/index.js";

import { ApiError } from "./utils/ApiError.js";


// * App routes



const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials:true
    }
})

app.set("io", io);


//global middlewares
app.use(
    cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
)


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
    },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
})

app.use(limiter)
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())


initializeSocketIO(io)

export { httpServer };