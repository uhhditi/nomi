import express from 'express';
import 'dotenv/config'
import groupRoutes from './routes/groupRoutes.js'
import userRoutes from './routes/userRoutes.js'
import symptomRoutes from './routes/symptomRoutes.js'
import cors from 'cors';
import { verifyToken } from './middlewares/validationMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// app.use('/logs', verifyToken, logsRoutes);
app.use('/user', userRoutes);
app.use('/symptom', verifyToken, symptomRoutes);
app.use('/group', verifyToken, groupRoutes);


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});
