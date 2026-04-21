'use server';

export async function saveJournalEntry(formData: { content: string }) {
  const content = formData.content;

  // For now, we'll just log it to the terminal
  console.log("Saving to Database:", content);

  // This is where the SQL code will go later:
  // await sql`INSERT INTO entries (content) VALUES (${content})`;
  
  return { success: true };
}