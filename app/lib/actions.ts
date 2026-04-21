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