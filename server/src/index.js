import express from 'express';
import 'dotenv/config'
import logsRoutes from './routes/logsRoutes.js'
import userRoutes from './routes/userRoutes.js'
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/logs', logsRoutes);
app.use('/user', userRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server listening on port 3001');
  });