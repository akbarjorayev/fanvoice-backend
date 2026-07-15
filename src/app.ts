import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import dotenv from 'dotenv';
import router from './routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();

app.use(compression());

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(router);

app.use(errorHandler);

export default app;
