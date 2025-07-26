/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import MainLayout from '@/components/MainLayout';
import { useRouter } from 'next/navigation';
import { useQuizResultStore } from '@/store/quizResultStore';
import { useEffect, useMemo, useState } from 'react';
import type { Question } from '@/app/(app)/u/quiz-type/[quizId]/page';

// Komponen untuk menampilkan review satu soal (tidak berubah)
function ResultItem({ question, userAnswer }: { question: Question; userAnswer: string | string[] | null }) {
	const isCorrect = useMemo(() => {
		if (userAnswer === null) return false;
		if (Array.isArray(question.answer)) {
			const sortedUser = Array.isArray(userAnswer) ? [...userAnswer].sort() : [];
			const sortedCorrect = [...question.answer].sort();
			return JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
		}
		return userAnswer === question.answer;
	}, [question, userAnswer]);

	const formatAnswer = (answer: any) => {
		if (answer === null || answer === undefined) return 'Tidak dijawab';
		if (Array.isArray(answer)) return answer.join(', ');
		return answer;
	};

	return (
		<div className={`p-6 border-2 rounded-xl ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
			<p className="font-semibold text-text-primary text-lg">{question.question}</p>
			<p className={`text-base mt-3 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
				Jawaban Anda: <span className="font-bold">{formatAnswer(userAnswer)}</span>
			</p>
			{!isCorrect && (
				<p className="text-base mt-2 text-blue-700">
					Jawaban Benar: <span className="font-bold">{formatAnswer(question.answer)}</span>
				</p>
			)}
		</div>
	);
}

export default function CongratsPage() {
	const router = useRouter();
	const { quizData, userAnswers } = useQuizResultStore((state) => state);

	// State untuk melacak soal mana yang sedang ditampilkan di review
	const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

	useEffect(() => {
		if (!quizData) {
			router.replace('/u');
		}
	}, [quizData, router]);

	// Kalkulasi skor dan status jawaban untuk sidebar
	const results = useMemo(() => {
		if (!quizData) return { correctCount: 0, incorrectCount: 0, answerStatuses: [] };

		let correct = 0;
		const statuses: boolean[] = quizData.questions.map((q, index) => {
			const uAnswer = userAnswers[index];
			let isCorrect = false;
			if (Array.isArray(q.answer)) {
				const sortedUser = Array.isArray(uAnswer) ? [...uAnswer].sort() : [];
				const sortedCorrect = [...q.answer].sort();
				if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)) {
					isCorrect = true;
				}
			} else {
				if (uAnswer === q.answer) {
					isCorrect = true;
				}
			}
			if (isCorrect) correct++;
			return isCorrect;
		});

		return {
			correctCount: correct,
			incorrectCount: quizData.questions.length - correct,
			answerStatuses: statuses,
		};
	}, [quizData, userAnswers]);

	if (!quizData) {
		return <div className="text-center p-10">Memuat hasil...</div>;
	}

	const selectedQuestion = quizData.questions[selectedQuestionIndex];
	const selectedUserAnswer = userAnswers[selectedQuestionIndex] || null;

	return (
		<MainLayout>
			<div className="max-w-6xl mx-auto p-6">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-semibold text-color-brand">Quiz Complete!</h2>
					<p className="mt-2 text-text-secondary">Berikut adalah hasil dan review dari kuis Anda.</p>
				</div>

				<div className="flex flex-col md:flex-row gap-6">
					{/* Main Content: Skor & Review Soal Terpilih */}
					<div className="flex-grow">
						{/* Score Summary */}
						<div className="grid grid-cols-2 gap-4 mb-8">
							<div className="flex flex-col items-center justify-center bg-green-500 rounded-2xl p-1 text-white shadow-lg">
								<div className="my-1 font-semibold">Correct</div>
								<div className="flex items-center justify-center bg-white text-green-500 rounded-xl px-4 py-6 w-full">
									<span className="material-icons-outlined mr-2">check_circle</span>
									<span className="font-bold text-lg">{results.correctCount}</span>
								</div>
							</div>
							<div className="flex flex-col items-center justify-center bg-red-500 rounded-2xl p-1 text-white shadow-lg">
								<div className="my-1 font-semibold">Incorrect</div>
								<div className="flex items-center justify-center bg-white text-red-500 rounded-xl px-4 py-6 w-full">
									<span className="material-icons-outlined mr-2">cancel</span>
									<span className="font-bold text-lg">{results.incorrectCount}</span>
								</div>
							</div>
						</div>

						{/* Review Soal Terpilih */}
						<h3 className="text-xl font-bold text-text-primary mb-4">Review Soal #{selectedQuestionIndex + 1}</h3>
						<ResultItem question={selectedQuestion} userAnswer={selectedUserAnswer} />
					</div>

					{/* Sidebar Navigasi Review */}
					<aside className="w-full md:w-56 flex-shrink-0 p-4 border-2 rounded-lg bg-gray-50">
						<h3 className="font-bold mb-4 text-center">Navigasi Review</h3>
						<div className="grid grid-cols-5 md:grid-cols-4 gap-2">
							{results.answerStatuses.map((isCorrect, index) => {
								const isSelected = index === selectedQuestionIndex;
								return (
									<button
										key={index}
										onClick={() => setSelectedQuestionIndex(index)}
										className={`h-10 w-10 rounded-lg font-bold border-2 transition
                        ${isSelected ? 'ring-4 ring-offset-2 ring-blue-500' : ''}
                        ${isCorrect ? 'bg-green-500 border-green-600 text-white' : 'bg-red-500 border-red-600 text-white'}
                        `}
									>
										{index + 1}
									</button>
								);
							})}
						</div>
					</aside>
				</div>

				<div className="mt-10 text-center">
					<button onClick={() => router.push('/u/congrats-streak')} className="w-full max-w-md bg-color-brand text-text-negative p-4 font-bold text-lg rounded-xl hover:brightness-90 transition cursor-pointer">
						NEXT
					</button>
				</div>
			</div>
		</MainLayout>
	);
}
