'use server';
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';

const sql = neon(process.env.DATABASE_URL!);

// Unified Save: Handles creating NEW drafts and NEW published entries
export async function saveEntry({ content, isDraft }: { content: string, isDraft: boolean }) {
  try {
    await sql`
      INSERT INTO entries (content, status, created_at) 
      VALUES (${content}, ${isDraft ? 'draft' : 'published'}, NOW())
    `;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Save Error:", error);
    return { success: false };
  }
}

// Update: Specifically for editing an existing draft
export async function updateDraft(id: number, content: string) {
  try {
    await sql`
      UPDATE entries 
      SET content = ${content}, created_at = NOW() 
      WHERE id = ${id} AND status = 'draft'
    `;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getPublishedEntries() {
  return await sql`SELECT * FROM entries WHERE status = 'published' ORDER BY created_at DESC`;
}

export async function getDraftEntries() {
  return await sql`SELECT * FROM entries WHERE status = 'draft' ORDER BY created_at DESC`;
}

export async function publishDraft(id: number, content: string) {
  try {
    await sql`
      UPDATE entries 
      SET content = ${content}, status = 'published', created_at = NOW() 
      WHERE id = ${id}
    `;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}