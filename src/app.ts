import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
const uploadDir = process.env.UPLOAD_DIR ?? 'uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

app.use('/api', routes);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.resolve('frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
} else {
  app.use(notFound);
}

app.use(errorHandler);

export default app;
