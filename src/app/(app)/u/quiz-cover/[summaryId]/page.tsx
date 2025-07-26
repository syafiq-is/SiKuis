/* eslint-disable @typescript-eslint/no-explicit-any */
import MainLayout from '@/components/MainLayout';
import { createClientServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

export default async function QuizCoverPage({ params }: { params: { summaryId: string } }) {
	const supabase = await createClientServer();

	const { data: summary, error: summaryError } = await supabase.from('summaries').select('id, title, summary').eq('id', params.summaryId).single();

	if (summaryError || !summary) {
		notFound();
	}

	const { data: quiz, error: quizError } = await supabase.from('quizzes').select('id, questions').eq('summary_id', summary.id).single();

	if (quizError || !quiz) {
		console.error('Quiz not found for summary:', summary.id);
		redirect('/u');
	}

	const questionCount = quiz.questions.length;
	// ✅ PERUBAHAN: Logika untuk mendapatkan tipe soal yang unik
	const questionTypes = [...new Set(quiz.questions.map((q: any) => q.type))];

	return (
		<MainLayout>
			<div className="max-w-xl mx-auto p-6 text-center">
				<div className="flex justify-center text-color-brand mb-6">
					<span className="material-icons-outlined" style={{ fontSize: '120px' }}>
						quiz
					</span>
				</div>

				<h1 className="text-3xl font-bold text-color-brand">{summary.title}</h1>

				{/* ✅ PERUBAHAN: Tampilan tipe soal menjadi lebih jelas dengan badge */}
				<div className="py-4 text-text-secondary font-regular flex justify-center items-center gap-2 flex-wrap">
					<span>{questionCount} Pertanyaan</span>
					<span className="text-gray-300">•</span>
					{questionTypes.map((type) => (
						<span key={type} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
							{type}
						</span>
					))}
				</div>

				<p className="text-slate-600 mb-8">{summary.summary}</p>

				<Link href={`/u/quiz-type/${quiz.id}`} className="w-full inline-block bg-color-brand text-text-negative p-4 font-bold text-lg rounded-xl hover:brightness-90 transition">
					START QUIZ
				</Link>

				<div className="mt-10 text-left">
					<h2 className="font-semibold mb-4">Riwayat Pengerjaan</h2>
					<p className="text-sm text-gray-500">Anda belum pernah mengerjakan kuis ini.</p>
				</div>
			</div>
		</MainLayout>
	);
}
