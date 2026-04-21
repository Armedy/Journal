"use client";
import { useState } from 'react';
import { saveJournalEntry } from './lib/actions';
saveJournalEntry

export default function JournalHome() {
  const [entry, setEntry] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!entry) return alert("Write something first!");
    
    setIsSaving(true);
    try {
      await saveJournalEntry({ content: entry });
      alert("Saved to local console!");
      setEntry(""); // Clear the box after saving
    } catch (error) {
      alert("Error saving entry");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-serif font-bold text-slate-800">My Digital Journal</h1>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all disabled:bg-gray-400"
        >
          {isSaving ? "Saving..." : "Save Entry"}
        </button>
      </header>
      
      <textarea
        className="w-full h-[60vh] p-6 text-lg border-none rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-200 outline-none resize-none bg-white text-slate-700"
        placeholder="Dear Diary..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />
    </main>
  );
}