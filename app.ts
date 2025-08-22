import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;
import router from './routes/routes';

app.use(express.json());
app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});