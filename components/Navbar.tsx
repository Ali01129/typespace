"use client";

import { useState } from "react";
import {
  Copy,
  MonitorUp,
  CheckCheck,
  LaptopMinimal,
  MoreHorizontal,
} from "lucide-react";

type NavbarProps = {
  note: string;
};

export default function Navbar({ note }: NavbarProps) {
  const wordCount = note.trim() === "" ? 0 : note.trim().split(/\s+/).length;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!note.trim()) return;

    navigator.clipboard.writeText(note);
    setCopied(true);
    
    // reset to false after 2 secs
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-black text-white">
      {/* Left-side */}
      <div className="text-xl font-bold rounded-md px-2 py-1 hover:bg-[#262626]">
        <LaptopMinimal size={24}/>
      </div>

      {/* Right-side */}
      <div className="flex items-center gap-3">
        {/* Word Counter */}
        <span className="text-sm text-gray-300 rounded-md px-2 py-1 hover:bg-[#262626]">
          {wordCount > 1 ? `${wordCount} words` : `${wordCount} word`}
        </span>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          disabled={!note.trim()}
          className={`p-2 rounded-md transition-colors ${
            note.trim()
              ? "hover:bg-[#262626] cursor-pointer"
              : "cursor-not-allowed text-gray-500"
          }`}
          title="Copy to clipboard"
        >
          {copied ? <CheckCheck size={20} /> : <Copy size={20} />}
        </button>

        {/* Share button */}
        <button
          onClick={() => alert("Share feature coming soon!")}
          disabled={!note.trim()}
          className={`p-2 rounded-md transition-colors ${
            note.trim()
              ? "hover:bg-[#262626] cursor-pointer"
              : "cursor-not-allowed text-gray-500"
          }`}
          title="Share"
        >
          <MonitorUp size={20} />
        </button>

        {/* Options button */}
        <button
          className="hover:bg-[#262626] cursor-pointer p-2 rounded-md transition-colors"
          title="Options"
        >
          <MoreHorizontal size={22} />
        </button>
      </div>
    </nav>
  );
}
