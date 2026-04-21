"use client";
import { useState, useEffect } from 'react';
import { saveJournalEntry, getJournalEntries } from './lib/actions';
saveJournalEntry


export default function JournalHome() {
  const [entry, setEntry] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load entries from Database
  const loadEntries = async () => {
    const data = await getJournalEntries();
    setHistory(data);
  };

  useEffect(() => { loadEntries(); }, []);

  const handleSave = async () => {
    if (!entry) return;
    setIsSaving(true);
    await saveJournalEntry({ content: entry });
    setEntry(""); // Clear editor
    await loadEntries(); // Refresh list
    setIsSaving(false);
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-10">
      <section>
        <h1 className="text-2xl font-bold mb-4">New Entry</h1>
        <textarea 
          className="w-full h-64 p-4 border rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="What's on your mind?"
        />
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSaving ? "Saving..." : "Save to Journal"}
        </button>
      </section>

      <section className="border-t pt-10">
        <h2 className="text-xl font-semibold mb-6">Past Entries</h2>
        <div className="space-y-6">
          {history.map((item) => (
            <div key={item.id} className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-500 mb-2">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
              <p className="whitespace-pre-wrap text-gray-800">{item.content}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}