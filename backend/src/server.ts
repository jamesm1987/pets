import express from 'express';
import cors from 'cors';
import { connect, initializeSchemas } from './db/database';
import { config } from './config/config';
import routes from './routes';

const app = express();
const PORT = config.port;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

(async () => {
  try {
    await connect();
    await initializeSchemas();
    console.log('Database connected and schemas initialized.');
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
