"use client";

import { X, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    setCopied(true)
    navigator.clipboard.writeText("101-101");
    setTimeout(() => setCopied(false), 1000);
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
            <div className="mb-6 relative">
              <input
                type="text"
                placeholder="101-101"
                className="w-full px-3 py-2 pr-10 bg-black border border-white rounded-lg text-white font-mono text-sm"
                readOnly
              />
              <button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <CheckCheck size={20} color="green" /> : <Copy size={20} />}
              </button>
            </div>
          <div className="flex justify-end">
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
