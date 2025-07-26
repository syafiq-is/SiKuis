/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClientServer } from '@/lib/supabase/server';
import { getAISummaryAndQuizFromTopic } from '@/lib/getAISummaryAndQuiz';

export interface QuizGenerationState {
  data?: {
    summaryId: string;
    title: string;
  };
  error?: string | null;
}

export async function generateQuizFromTopicAction(
  prevState: QuizGenerationState,
  formData: FormData
): Promise<QuizGenerationState> {
  const supabase = await createClientServer();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Anda harus login untuk membuat kuis.' };
  }

  const topic = formData.get('topic') as string;
  const quizOptions = {
    numQuestions: Number(formData.get('numQuestions')),
    difficulty: formData.get('difficulty') as 'Easy' | 'Medium' | 'Hard',
    questionTypes: formData.getAll('questionTypes') as string[],
  };

  if (!topic) {
    return { error: 'Topik tidak boleh kosong.' };
  }

  try {
    // Panggil fungsi AI yang baru dengan topik dan opsi
    const aiContent = await getAISummaryAndQuizFromTopic(topic, quizOptions);

    // Simpan ke Database (logika ini tetap sama)
    const { data: summaryData, error: summaryError } = await supabase
      .from('summaries')
      .insert({ user_id: user.id, title: topic, summary: aiContent.summary })
      .select('id')
      .single();

    if (summaryError) throw new Error(`Gagal menyimpan ringkasan: ${summaryError.message}`);

    const { error: quizError } = await supabase.from('quizzes').insert({
      user_id: user.id,
      summary_id: summaryData.id,
      title: `${topic} Quiz`,
      questions: aiContent.questions,
    });

    if (quizError) throw new Error(`Gagal menyimpan kuis: ${quizError.message}`);

    // Kembalikan data untuk redirect
    return { data: { summaryId: summaryData.id, title: topic } };

  } catch (e: any) {
    console.error('Action Gagal:', e.message);
    return { error: e.message };
  }
}
