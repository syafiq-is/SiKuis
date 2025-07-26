/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useState } from 'react';

// Definisikan tipe data agar konsisten
type Roadmap = {
	id: string;
	title: string;
	data: any[]; // Sebaiknya definisikan tipe data yang lebih spesifik
};

type Summary = {
	id: string;
	title: string;
	created_at: string;
};

interface DashboardClientProps {
	initialRoadmaps: Roadmap[];
	initialSummaries: Summary[];
}

export function DashboardClient({ initialRoadmaps, initialSummaries }: DashboardClientProps) {
	const [selectedTab, setSelectedTab] = useState<string>('all');

	const handleTabClick = (tab: string) => {
		setSelectedTab(tab);
	};

	// Format tanggal menjadi lebih mudah dibaca
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	return (
		<div className="container mx-auto p-6">
			{/* Tombol Tab */}
			<div className="flex space-x-2 mb-6">
				{['all', 'roadmaps', 'summary'].map((tab) => (
					<button
						key={tab}
						onClick={() => handleTabClick(tab)}
						className={`px-4 py-2 rounded-xl font-semibold border-2 transition ${selectedTab === tab ? 'bg-color-brand text-white border-color-brand' : 'border-text-secondary text-text-secondary hover:bg-gray-100'}`}
					>
						{tab === 'all' ? 'All' : tab === 'roadmaps' ? 'Roadmaps' : 'Summary & Quiz'}
					</button>
				))}
			</div>

			<div className="space-y-8">
				{/* BAGIAN ROADMAPS */}
				{(selectedTab === 'all' || selectedTab === 'roadmaps') && (
					<section>
						<div className="font-semibold mb-4 flex justify-between items-center">
							<h2 className="text-xl">Roadmaps</h2>
							<Link href="/roadmaps" className="border rounded-xl py-1 px-3 flex items-center text-sm">
								<span className="material-icons mr-1" style={{ fontSize: '1rem' }}>
									add
								</span>
								Add
							</Link>
						</div>
						<ul className="space-y-3">
							{initialRoadmaps.length > 0 ? (
								initialRoadmaps.map((roadmap) => (
									<li key={roadmap.id}>
										<Link href={`/u/roadmaps/${roadmap.id}`}>
											<div className="relative w-full bg-white border-2 p-4 font-semibold rounded-xl hover:border-color-brand transition cursor-pointer flex items-center">
												<span className="material-icons text-color-brand mr-4">map</span>
												<div className="w-full text-left">
													<h3>{roadmap.title}</h3>
													<p className="text-text-secondary font-normal text-sm">{roadmap.data.length} Steps</p>
												</div>
												<div className="text-color-brand text-2xl leading-none">
													<span className="material-icons">more_vert</span>
												</div>
											</div>
										</Link>
									</li>
								))
							) : (
								<p className="text-sm text-gray-500">Anda belum memiliki roadmap.</p>
							)}
						</ul>
					</section>
				)}

				{/* BAGIAN SUMMARY & QUIZ (SEKARANG DINAMIS) */}
				{(selectedTab === 'all' || selectedTab === 'summary') && (
					<section>
						<div className="font-semibold mb-4 flex justify-between items-center">
							<h2 className="text-xl">Summary & Quiz</h2>
							<Link href="/quiz" className="border rounded-xl py-1 px-3 flex items-center text-sm">
								<span className="material-icons mr-1" style={{ fontSize: '1rem' }}>
									add
								</span>
								Add
							</Link>
						</div>
						<ul className="space-y-3">
							{initialSummaries.length > 0 ? (
								initialSummaries.map((summary) => (
									<li key={summary.id}>
										{/* Link ini akan mengarah ke halaman sampul kuis */}
										<Link href={`/u/quiz-cover/${summary.id}`}>
											<div className="relative w-full bg-white border-2 p-4 font-semibold rounded-xl hover:border-color-brand transition cursor-pointer flex items-center">
												<span className="material-icons text-color-brand mr-4">quiz</span>
												<div className="w-full text-left">
													<h3>{summary.title}</h3>
													<p className="text-text-secondary font-normal text-sm">Dibuat pada {formatDate(summary.created_at)}</p>
												</div>
												<div className="text-color-brand text-2xl leading-none">
													<span className="material-icons">more_vert</span>
												</div>
											</div>
										</Link>
									</li>
								))
							) : (
								<p className="text-sm text-gray-500">Anda belum memiliki ringkasan atau kuis.</p>
							)}
						</ul>
					</section>
				)}
			</div>
		</div>
	);
}
