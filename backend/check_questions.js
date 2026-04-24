import mongoose from 'mongoose';
import Question from './models/Question.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function checkQuestions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz');
        const questions = await Question.find({ quizCode: 'Demo' });
        console.log(JSON.stringify(questions, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
checkQuestions();
