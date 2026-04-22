'use server';
import { neon } from '@neondatabase/serverless'; // Use Neon instead
import { revalidatePath } from 'next/cache';

// Initialize the SQL connection
const sql = neon(process.env.DATABASE_URL!);

export async function saveJournalEntry(formData: { content: string }) {
  const { content } = formData;
  try {
    // Create table if missing
    await sql`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`INSERT INTO entries (content) VALUES (${content});`;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function getJournalEntries() {
  try {
    const data = await sql`SELECT * FROM entries ORDER BY created_at DESC`;
    return data; // Neon returns rows directly
  } catch (error) {
    return [];
  }
}
export async function saveDraft(content: string) {
  try {
    // 1. Create drafts table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS drafts (
        id INTEGER PRIMARY KEY,
        content TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Upsert the draft (ID 1 is our "Working Draft")
    await sql`
      INSERT INTO drafts (id, content, updated_at) 
      VALUES (1, ${content}, NOW())
      ON CONFLICT (id) DO UPDATE SET content = ${content}, updated_at = NOW();
    `;
    return { success: true };
  } catch (error) {
    console.error("Draft Error:", error);
    return { success: false };
  }
}

export async function getLatestDraft() {
  try {
    const rows = await sql`SELECT content FROM drafts WHERE id = 1`;
    return rows[0]?.content || "";
  } catch (error) {
    return "";
  }
}