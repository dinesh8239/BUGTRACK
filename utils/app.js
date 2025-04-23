import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';


dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));


import authRoutes from '../routes/auth.routes.js';
import projectRoutes from '../routes/project.routes.js';
import bugRoutes from '../routes/bug.routes.js'

// Routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/bugs', bugRoutes);

export default app;