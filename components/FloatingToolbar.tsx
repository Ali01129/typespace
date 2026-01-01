"use client";

import { Bold, Italic, Underline, Code, Link as LinkIcon, RotateCcw } from "lucide-react";

type FloatingToolbarProps = {
  position: { top: number; left: number };
  onFormat: (format: "bold" | "italic" | "underline" | "code" | "link" | "revert") => void;
  onClose: () => void;
};

export default function FloatingToolbar({
  position,
  onFormat,
  onClose,
}: FloatingToolbarProps) {
  return (
    <div
      data-toolbar="true"
      className="fixed z-50 bg-[#262626] border border-gray-600 rounded-lg shadow-lg flex items-center gap-1 p-1"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        onClick={() => onFormat("bold")}
        className="p-2 hover:bg-[#404040] rounded transition-colors"
        title="Bold"
      >
        <Bold size={16} />
      </button>

      <button
        onClick={() => onFormat("italic")}
        className="p-2 hover:bg-[#404040] rounded transition-colors"
        title="Italic"
      >
        <Italic size={16} />
      </button>

      <button
        onClick={() => onFormat("underline")}
        className="p-2 hover:bg-[#404040] rounded transition-colors"
        title="Underline"
      >
        <Underline size={16} />
      </button>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      <button
        onClick={() => onFormat("code")}
        className="p-2 hover:bg-[#404040] rounded transition-colors"
        title="Code"
      >
        <Code size={16} />
      </button>

      <button
        onClick={() => onFormat("link")}
        className="p-2 hover:bg-[#404040] rounded transition-colors"
        title="Link"
      >
        <LinkIcon size={16} />
      </button>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      <button
        onClick={() => onFormat("revert")}
        className="p-2 hover:bg-[#404040] rounded transition-colors"
        title="Revert to plain text"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
}

