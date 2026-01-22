"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { zustandStore } from "@/zustand/store";

export interface RetrieveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RetrieveModal({ isOpen, onClose }: RetrieveModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { setNote } = zustandStore();

  const handleRetrieve = async () => {
    if (!code.trim()) {
      setError("Please enter a code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/retrieve?code=${encodeURIComponent(code.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve note");
      }

      // Set the note in the store
      setNote(data.content);
      
      // Close the modal
      onClose();
      
      // Reset form
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retrieve note");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode("");
    setError("");
    onClose();
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
          <h2 className="text-white font-mono text-lg">Retrieve</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <div className="p-2 rounded-lg hover:bg-[#262626]">
              <X size={20} />
            </div>
          </button>
        </div>

        <div className="px-6 pb-6">
          <p className="text-gray-400 font-mono text-sm mb-4">
            Enter your Code here
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}
          <div className="mb-6 relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleRetrieve();
                }
              }}
              placeholder="101-101"
              className="w-full px-3 py-2 pr-10 bg-black border border-white rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleRetrieve}
              disabled={loading || !code.trim()}
              className="bg-white text-black px-4 py-2 rounded-lg font-mono text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
