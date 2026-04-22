"use client";
import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import { saveEntry, updateDraft, getPublishedEntries, getDraftEntries } from './lib/actions';

interface Entry {
  id: number;
  content: string;
  created_at: string;
  status: 'draft' | 'published';
}

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  const [, setUpdate] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const updateHandler = () => setUpdate(s => s + 1);
    editor.on('transaction', updateHandler);
    return () => { editor.off('transaction', updateHandler); };
  }, [editor]);

  if (!editor) return null;
  const btnClass = (name: string, attr = {}) => `p-2 rounded text-xs font-black border transition-all ${editor.isActive(name, attr) ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'text-slate-500 border-transparent hover:bg-[#222]'}`;

  return (
    <div className="flex gap-2 p-3 bg-[#111] border-b border-[#222]">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass('bold')}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass('italic')}>I</button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass('underline')}>U</button>
      <div className="w-px h-4 bg-[#333] mx-1 self-center" />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass('heading', { level: 2 })}>H2</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass('bulletList')}>List</button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass('codeBlock')}>Code</button>
    </div>
  );
};

export default function JournalHome() {
  const [published, setPublished] = useState<Entry[]>([]);
  const [drafts, setDrafts] = useState<Entry[]>([]);
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline, CodeBlock, Placeholder.configure({ placeholder: "Capture your thoughts..." })],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] p-10 text-white prose-strong:text-white prose-headings:text-white leading-relaxed' },
    },
  });

  // Load function moved to useCallback for use in manual actions
  const refreshData = useCallback(async () => {
    const [p, d] = await Promise.all([getPublishedEntries(), getDraftEntries()]);
    setPublished(p as Entry[]);
    setDrafts(d as Entry[]);
  }, []);

  // Standard effect for initial load - using internal async to satisfy linter
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      const [p, d] = await Promise.all([getPublishedEntries(), getDraftEntries()]);
      if (isMounted) {
        setPublished(p as Entry[]);
        setDrafts(d as Entry[]);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // 3-Minute Auto-Sync for Drafts
  useEffect(() => {
    if (!editor || activeEntry?.status === 'published') return;

    const interval = setInterval(async () => {
      const content = editor.getHTML();
      if (content && content !== '<p></p>') {
        setIsSyncing(true);
        if (activeEntry?.id) {
          await updateDraft(activeEntry.id, content);
        }
        setTimeout(() => setIsSyncing(false), 1500);
      }
    }, 180000);

    return () => clearInterval(interval);
  }, [editor, activeEntry]);

  const handleSelectEntry = (entry: Entry) => {
    setActiveEntry(entry);
    if (entry.status === 'draft') {
      editor?.commands.setContent(entry.content);
    }
  };

  const handleAction = async (asDraft: boolean) => {
    if (!editor || editor.isEmpty) return;
    setIsActioning(true);
    const content = editor.getHTML();

    if (activeEntry?.status === 'draft' && asDraft) {
      await updateDraft(activeEntry.id, content);
    } else {
      await saveEntry({ content, isDraft: asDraft });
    }

    editor.commands.clearContent();
    setActiveEntry(null);
    await refreshData();
    setIsActioning(false);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 overflow-hidden">
      <aside className="w-72 bg-[#0a0a0a] border-r border-[#111] flex flex-col shrink-0">
        <div className="p-5 border-b border-[#111]">
          <button onClick={() => { setActiveEntry(null); editor?.commands.clearContent(); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-3 rounded-xl uppercase tracking-widest shadow-lg active:scale-95 transition-all">
            + New Entry
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <section>
            <div className="px-3 py-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.25em] mb-1">Drafts</div>
            <div className="space-y-0.5">
              {drafts.map(item => (
                <button key={item.id} onClick={() => handleSelectEntry(item)} className={`w-full text-left px-3 py-2 text-[12px] rounded-md truncate transition-colors ${activeEntry?.id === item.id ? 'bg-blue-900/20 text-white border border-blue-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-[#111] border border-transparent'}`}>
                  <span className="mr-2 opacity-50">✎</span>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="px-3 py-2 text-[10px] font-black text-slate-700 uppercase tracking-[0.25em] mb-1">Archive</div>
            <div className="space-y-0.5">
              {published.map(item => (
                <button key={item.id} onClick={() => handleSelectEntry(item)} className={`w-full text-left px-3 py-2 text-[12px] rounded-md truncate transition-colors ${activeEntry?.id === item.id ? 'bg-[#1a1a1a] text-white border border-[#333]' : 'text-slate-500 hover:text-slate-300 hover:bg-[#111] border border-transparent'}`}>
                  <span className="mr-2 opacity-50">◈</span>
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </button>
              ))}
            </div>
          </section>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-[#050505]">
        <header className="h-16 flex items-center justify-between px-10 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-xl border-b border-[#111]">
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'}`} />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
              {activeEntry?.status === 'published' ? "Archive (Read Only)" : isSyncing ? "Syncing Draft" : "Editor"}
            </span>
          </div>
          
          {activeEntry?.status !== 'published' && (
            <div className="flex gap-4">
              <button onClick={() => handleAction(true)} disabled={isActioning} className="text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors">
                Save Draft
              </button>
              <button onClick={() => handleAction(false)} disabled={isActioning} className="bg-white text-black text-[10px] font-black uppercase px-6 py-2 rounded-lg hover:bg-slate-200 shadow-xl transition-all">
                {isActioning ? "..." : "Commit"}
              </button>
            </div>
          )}
        </header>

        <div className="max-w-4xl mx-auto p-10 md:p-20">
          <div className="mb-10">
            <h1 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none">
              {activeEntry ? new Date(activeEntry.created_at).toLocaleDateString(undefined, { dateStyle: 'full' }) : "New Entry"}
            </h1>
            <div className="h-1 w-20 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
          </div>

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-white/5">
            {activeEntry?.status === 'published' ? (
              <div className="prose prose-invert max-w-none text-white p-10 md:p-16 leading-relaxed" dangerouslySetInnerHTML={{ __html: activeEntry.content }} />
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