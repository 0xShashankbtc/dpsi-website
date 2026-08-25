import { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write or edit rich content here...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white text-slate-800 flex flex-col focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-sm">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-1.5 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          title="Bold (Ctrl+B)"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          title="Italic (Ctrl+I)"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          title="Underline (Ctrl+U)"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<h1>")}
          title="Heading 1"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors text-xs font-bold"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<h2>")}
          title="Heading 2"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors text-xs font-bold"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<p>")}
          title="Paragraph"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors text-xs"
        >
          P
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          title="Bullet List"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          title="Numbered List"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<blockquote>")}
          title="Quote"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("justifyLeft")}
          title="Align Left"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("justifyCenter")}
          title="Align Center"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("justifyRight")}
          title="Align Right"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={addLink}
          title="Insert Link"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 min-h-[160px] max-h-[300px] overflow-y-auto text-sm text-slate-800 outline-none max-w-none focus:outline-none"
        data-placeholder={placeholder}
      />
    </div>
  );
}
