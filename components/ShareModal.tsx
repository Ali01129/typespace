"use client";

import { X, Copy, CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: string;
}

export default function ShareModal({ isOpen, onClose, note }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCode("");
      setError("");
      setCopied(false);
    }
  }, [isOpen]);

  const handleShare = async () => {
    if (!note.trim()) {
      setError("Note is empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: note }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to share note");
      }

      setCode(data.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share note");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-[#18181B] rounded-xl shadow-lg w-[450px] max-w-[90vw] border border-white">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-white font-mono text-lg">Share</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <div className="p-2 rounded-lg hover:bg-[#262626]">
              <X size={20} />
            </div>
          </button>
        </div>

        <div className="px-6 pb-6">
          <p className="text-gray-400 font-mono text-sm mb-4">
            Give this code to share this note
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}
          <div className="mb-6 relative">
            <input
              type="text"
              value={loading ? "Generating..." : code}
              placeholder="101-101"
              className="w-full px-3 py-2 pr-10 bg-black border border-white rounded-lg text-white font-mono text-sm"
              readOnly
            />
            {code && (
              <button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors hover:bg-[#262626]"
                title="Copy to clipboard"
              >
                {copied ? <CheckCheck size={20} color="green" /> : <Copy size={20} />}
              </button>
            )}
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={handleShare}
              disabled={loading || !note.trim()}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg font-mono text-sm hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
            <button
              onClick={onClose}
              className="bg-white text-black px-4 py-2 rounded-lg font-mono text-sm hover:bg-gray-200 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
