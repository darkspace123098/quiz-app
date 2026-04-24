import mongoose from 'mongoose';
import Contestant from './models/Contestant.js';
import Question from './models/Question.js';
import ClassModel from './models/Class.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz');
        console.log('Connected to MongoDB');

        const usn = 'U05TY23S0001';
        const contestant = await Contestant.findOne({ usn });

        if (contestant) {
            console.log('Contestant found:', JSON.stringify(contestant, null, 2));
            // Reset results if needed to allow re-testing
            if (contestant.results && contestant.results.length > 0) {
                console.log('Resetting results for testing...');
                contestant.results = [];
                await contestant.save();
                console.log('Results reset.');
            }
        } else {
            console.log('Contestant not found. Creating one...');
            // Check if class exists
            let className = 'BCA-III';
            const cls = await ClassModel.findOne({ name: className });
            if (!cls) {
                await ClassModel.create({ name: className });
            }

            await Contestant.create({
                usn,
                name: 'Demo Student',
                className,
                quizCode: 'Demo',
                quizPassword: '0001'
            });
            console.log('Contestant created.');
        }

        // Ensure questions exist for the Demo quiz
        const questions = await Question.find({ quizCode: 'Demo' });
        if (questions.length === 0) {
            console.log('No questions found for Demo quiz. Creating some...');
            await Question.create([
                {
                    className: 'BCA-III',
                    quizCode: 'Demo',
                    questionText: 'What is 2+2?',
                    options: ['3', '4', '5', '6'],
                    correctAnswer: '4'
                },
                {
                    className: 'BCA-III',
                    quizCode: 'Demo',
                    questionText: 'Capital of France?',
                    options: ['London', 'Berlin', 'Paris', 'Madrid'],
                    correctAnswer: 'Paris'
                }
            ]);
            console.log('Demo questions created.');
        } else {
            console.log(`Found ${questions.length} questions for Demo quiz.`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkDB();
