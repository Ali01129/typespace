"use client";

import { useState, useRef, useEffect } from "react";
import {
  Copy,
  MonitorDown,
  MonitorUp,
  CheckCheck,
  LaptopMinimal,
  MoreHorizontal,
} from "lucide-react";
import Options from "./Options";

type NavbarProps = {
  note: string;
};

export default function Navbar({ note }: NavbarProps) {
  const wordCount = note.trim() === "" ? 0 : note.trim().split(/\s+/).length;
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (!note.trim()) return;

    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="relative flex items-center justify-between px-6 py-3 bg-black text-white">
      {/* Left: Logo */}
      <div className="text-xl font-bold tracking-wider cursor-pointer">
        <LaptopMinimal size={24} className="inline-block mr-2" />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Word counter */}
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

        <button
          className={`p-2 rounded-md transition-colors ${
            note.trim()
              ? "hover:bg-[#262626] cursor-pointer"
              : "cursor-not-allowed text-gray-500"
          }`}
          title="Share"
        >
          <MonitorUp size={20} />
        </button>

        <button
          className={`p-2 rounded-md transition-colors ${
            note.trim()
              ? "hover:bg-[#262626] cursor-pointer"
              : "cursor-not-allowed text-gray-500"
          }`}
          title="Recieve"
        >
          <MonitorDown size={20} />
        </button>

        {/* Options dropdown */}
        <div className="relative" ref={optionsRef}>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="hover:bg-[#262626] cursor-pointer p-2 rounded-md transition-colors"
            title="Options"
          >
            <MoreHorizontal size={22} />
          </button>

          {showOptions && <Options />}
        </div>
      </div>
    </nav>
  );
}
