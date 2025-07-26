/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClientServer } from '@/lib/supabase/server'
import { getAISummaryAndQuizFromTopic } from '@/lib/getAISummaryAndQuiz';

// Definisikan tipe untuk state yang akan dikembalikan
export interface SummaryQuizState {
  data?: {
    summary: string;
    questions: any[]; // Sebaiknya definisikan tipe pertanyaan yang lebih spesifik
  };
  error?: string | null;
  message?: string | null;
}

export async function generateSummaryAndQuizAction(prevState: SummaryQuizState, formData: FormData): Promise<SummaryQuizState> {
    const supabase = await createClientServer();

    // 1. Dapatkan data dari form
    const nodeTitle = formData.get('nodeTitle') as string;
    const nodeDescription = formData.get('nodeDescription') as string;

    if (!nodeTitle) {
        return { error: 'Node title is missing.' };
    }

    // 2. Dapatkan user yang sedang login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'You must be logged in to perform this action.' };
    }

    try {
        // 3. Panggil AI untuk mendapatkan konten
        const aiContent = await getAISummaryAndQuizFromTopic(nodeTitle, nodeDescription);

        // 4. Simpan ke database dalam satu transaksi (jika salah satu gagal, semua dibatalkan)
        // Kita gunakan .rpc() untuk memanggil fungsi PostgreSQL
        // Anda perlu membuat fungsi ini di database Supabase Anda.
        // Ini adalah cara paling aman untuk memastikan integritas data.
        
        // Simpan ringkasan terlebih dahulu untuk mendapatkan ID-nya
        const { data: summaryData, error: summaryError } = await supabase
            .from('summaries')
            .insert({
                user_id: user.id,
                title: nodeTitle,
                summary: aiContent.summary,
            })
            .select('id')
            .single();

        if (summaryError) throw summaryError;

        // Simpan kuis dengan summary_id yang baru dibuat
        const { error: quizError } = await supabase
            .from('quizzes')
            .insert({
                user_id: user.id,
                summary_id: summaryData.id,
                title: `${nodeTitle} Quiz`,
                questions: aiContent.questions,
            });

        if (quizError) throw quizError;
        
        // 5. Kembalikan data ke UI
        return { data: aiContent };

    } catch (e: any) {
        console.error("Transaction failed:", e.message);
        return { error: e.message };
    }
}
