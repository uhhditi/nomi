import express from 'express';
import 'dotenv/config'
import logsRoutes from './routes/logsRoutes.js'
import userRoutes from './routes/userRoutes.js'
import symptomRoutes from './routes/symptomRoutes.js'
import cors from 'cors';
import { verifyToken } from './middlewares/validationMiddleware.js';
import groupRoutes from './routes/groupRoutes.js';
import choreRoutes from './routes/choreRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use('/logs', verifyToken, logsRoutes);
app.use('/user', userRoutes);
app.use('/symptom', verifyToken, symptomRoutes);
app.use('/groups', verifyToken, groupRoutes);
app.use('/chores', verifyToken, choreRoutes);
app.use('/receipts', receiptRoutes);
app.use('/expenses', expenseRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);



});
