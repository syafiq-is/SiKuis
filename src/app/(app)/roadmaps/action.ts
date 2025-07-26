/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import { getAIRoadmap } from '@/lib/getAIRoadmap'

// Tipe untuk state yang akan dikelola oleh useActionState
export interface RoadmapState {
  data?: any; // Tipe data roadmap Anda
  error?: string | null;
  message?: string | null;
}

export async function generateRoadmapAction(prevState: RoadmapState, formData: FormData): Promise<RoadmapState> {
  const topic = formData.get('topic') as string;
  if (!topic) {
    return { error: 'Topic cannot be empty.' };
  }

  try {
    const roadmapData = await getAIRoadmap(topic);
    // Jika berhasil, kembalikan datanya. UI akan menampilkannya.
    return { data: roadmapData, message: "Roadmap generated successfully! Don't forget to save." };
  } catch (e: any) {
    // Jika getAIRoadmap gagal, tangkap errornya
    return { error: e.message };
  }
}

export async function saveRoadmapAction(formData: FormData) {
  const supabase = await createClientServer();

    // Ambil data dari form
    const title = formData.get('title') as string;
    const roadmapDataString = formData.get('roadmapData') as string;

    if (!title || !roadmapDataString) {
        return { error: 'Title and roadmap data are required to save.' };
    }

    let roadmapData;
    try {
        roadmapData = JSON.parse(roadmapDataString);
    } catch (e) {
        console.log('Error parsing roadmap data:', e);
        return { error: 'Invalid roadmap data format.' };
    }

    // Dapatkan user_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'You must be logged in to save a roadmap.' };
    }

    // Simpan ke Supabase
    const { data, error } = await supabase
        .from('roadmaps')
        .insert({
            user_id: user.id,
            title: title,
            data: roadmapData, // 'data' adalah nama kolom jsonb Anda
        })
        .select()
        .single();
    
    if (error) {
        console.error('Supabase save error:', error);
        return { error: 'Failed to save roadmap to your account.' };
    }

    // Redirect ke halaman detail setelah berhasil menyimpan
    revalidatePath('/u/roadmaps'); // Revalidasi halaman daftar roadmap
    redirect(`/u/roadmaps/${data.id}`);
}
