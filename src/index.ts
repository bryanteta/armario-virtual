import 'dotenv/config';
import app from './app';
import { connectDatabase } from './config/database';

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV ?? 'development'}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
