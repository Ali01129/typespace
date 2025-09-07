"use client";

import { Copy, Vibrate, MoreHorizontal } from "lucide-react";

type NavbarProps = {
  note: string;
};

export default function Navbar({ note }: NavbarProps) {
  const wordCount = note.trim() === "" ? 0 : note.trim().split(/\s+/).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(note);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-black text-white">
      {/* Left: */}
      <div className="text-xl font-bold tracking-wider">
        <Vibrate size={24} className="inline-block mr-2" />
      </div>

      {/* Right: */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300 rounded-md px-2 py-1 hover:bg-[#262626] cursor-pointer">
          {wordCount > 1 ? `${wordCount} words` : `${wordCount} word`}
        </span>

        <button
          onClick={handleCopy}
          className="hover:bg-[#262626] cursor-pointer p-2 rounded-md"
          title="Copy to clipboard"
        >
          <Copy size={20} />
        </button>

        <button className="hover:bg-[#262626] cursor-pointer p-2 rounded-md" title="Options">
          <MoreHorizontal size={22} />
        </button>
      </div>
    </nav>
  );
}
