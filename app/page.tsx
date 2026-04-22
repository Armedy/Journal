"use client";
import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import { saveJournalEntry, getJournalEntries, saveDraft, getLatestDraft } from './lib/actions';

interface Entry {
  id: number;
  content: string;
  created_at: string;
}

// --- Responsive Toolbar ---
const Toolbar = ({ editor }: { editor: Editor | null }) => {
  // This state forces the toolbar to re-render when the editor state changes
  const [, setUpdate] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const updateHandler = () => setUpdate(s => s + 1);
    editor.on('transaction', updateHandler);
    return () => { editor.off('transaction', updateHandler); };
  }, [editor]);

  if (!editor) return null;

  const btnClass = (name: string, attributes = {}) => {
    const active = editor.isActive(name, attributes);
    return `p-2 rounded text-xs font-black transition-all duration-150 border ${
      active 
        ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105' 
        : 'text-slate-500 border-transparent hover:bg-[#252525] hover:text-slate-200'
    }`;
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-[#111] border-b border-[#222] sticky top-0 z-20">
      <div className="flex gap-1 bg-[#0a0a0a] p-1 rounded-lg border border-[#222]">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass('bold')}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass('italic')}>I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass('underline')}>U</button>
      </div>

      <div className="flex gap-1 bg-[#0a0a0a] p-1 rounded-lg border border-[#222]">
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass('heading', { level: 2 })}>H2</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass('bulletList')}>List</button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass('codeBlock')}>Code</button>
      </div>

      <div className="flex gap-1 p-1">
        <button 
          onClick={() => editor.chain().focus().undo().run()} 
          disabled={!editor.can().undo()}
          className="px-2 text-[10px] font-bold text-slate-600 hover:text-white disabled:opacity-10"
        >
          UNDO
        </button>
      </div>
    </div>
  );
};

export default function JournalHome() {
  const [history, setHistory] = useState<Entry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline, CodeBlock, Placeholder.configure({ placeholder: "Capture your thoughts..." })],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: { 
        class: 'prose prose-invert prose-slate max-w-none focus:outline-none min-h-[500px] p-8 md:p-14 text-white leading-relaxed selection:bg-blue-600/40' 
      },
    },
  });

  const loadEntries = useCallback(async () => {
    const data = await getJournalEntries();
    setHistory(data as Entry[]);
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadEntries();
      const savedDraft = await getLatestDraft();
      if (savedDraft && editor && editor.isEmpty) editor.commands.setContent(savedDraft);
    };
    init();
  }, [editor, loadEntries]);

  useEffect(() => {
    if (!editor) return;
    const interval = setInterval(async () => {
      const currentContent = editor.getHTML();
      if (currentContent && currentContent !== '<p></p>') {
        setIsSyncing(true);
        await saveDraft(currentContent);
        setTimeout(() => setIsSyncing(false), 1500);
      }
    }, 180000); 
    return () => clearInterval(interval);
  }, [editor]);

  const handleSave = async () => {
    if (!editor || editor.isEmpty) return;
    setIsSaving(true);
    await saveJournalEntry({ content: editor.getHTML() });
    await saveDraft(""); 
    editor.commands.clearContent();
    await loadEntries();
    setIsSaving(false);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 overflow-hidden font-sans">
      <aside className="w-72 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col shrink-0">
        <div className="p-5">
          <button 
            onClick={() => { setActiveEntry(null); editor?.commands.clearContent(); }} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-3 rounded-xl transition-all uppercase tracking-[0.2em] shadow-lg shadow-blue-900/30 active:scale-95"
          >
            + New Journal Entry
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          <div className="px-3 py-4 text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Archive</div>
          {history.map((item) => {
            const dateObj = new Date(item.created_at);
            const isActive = activeEntry?.id === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => setActiveEntry(item)}
                className={`w-full text-left px-4 py-3 rounded-xl truncate transition-all border ${
                  isActive ? 'bg-[#111] border-[#333] text-white shadow-xl' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#0f0f0f]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[12px]">{dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  <span className="font-mono text-[9px] opacity-40 uppercase">
                    {dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#050505] relative">
        <header className="h-16 flex items-center justify-between px-10 bg-[#050505]/90 backdrop-blur-xl sticky top-0 z-30 border-b border-[#111]">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'}`} />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
              {activeEntry ? "Viewing Mode" : isSyncing ? "Cloud Sync" : "Drafting"}
            </span>
          </div>
          {!activeEntry && (
            <button 
              onClick={handleSave} 
              className="bg-white text-black text-[10px] font-black uppercase px-6 py-2 rounded-lg hover:bg-slate-200 transition-all shadow-xl active:translate-y-0.5"
            >
              {isSaving ? "Saving..." : "Save Entry"}
            </button>
          )}
        </header>

        <div className="max-w-4xl mx-auto p-10 md:p-20">
          <div className="mb-12">
            <h1 className="text-6xl font-black text-white tracking-tighter mb-6 leading-none">
              {activeEntry ? new Date(activeEntry.created_at).toLocaleDateString(undefined, { dateStyle: 'full' }) : "Journal your thoughts"}
            </h1>
            <div className="h-1.5 w-24 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)]" />
          </div>

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-white/5">
            {activeEntry ? (
              <div className="prose prose-invert max-w-none text-white p-10 md:p-16 leading-relaxed">
                 <div dangerouslySetInnerHTML={{ __html: activeEntry.content }} />
              </div>
            ) : (
              <>
                <Toolbar editor={editor} />
                <EditorContent editor={editor} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}