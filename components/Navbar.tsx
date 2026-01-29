"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  MonitorDown,
  MonitorUp,
  CheckCheck,
  LaptopMinimal,
  MoreHorizontal,
} from "lucide-react";
import Options from "./Options";
import ShareModal from "./ShareModal";
import RetrieveModal from "./RetrieveModal";
import SignInModal from "./SignInModal";
import { zustandStore } from "@/zustand/store";
import { clearUserFromStorage } from "@/components/UserHydration";

type NavbarProps = {
  note: string;
  admin?: boolean;
};

export default function Navbar({ note, admin = false }: NavbarProps) {
  const router = useRouter();
  const setUser = zustandStore((s) => s.setUser);
  const wordCount = note.trim() === "" ? 0 : note.trim().split(/\s+/).length;
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRetrieveModalOpen, setIsRetrieveModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    setShowOptions(false);
    setUser(null);
    clearUserFromStorage();
    router.push("/");
  };

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

  if (admin) {
    return (
      <nav className="relative flex items-center justify-between px-6 py-3 bg-black text-white">
        <div className="text-xl font-bold tracking-wider cursor-pointer w-10">
          <LaptopMinimal size={24} className="inline-block mr-2" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-wider text-[#e2b714]">
          TypeSpace
        </div>
        <div className="relative" ref={optionsRef}>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="hover:bg-[#262626] cursor-pointer p-2 rounded-md transition-colors"
            title="Options"
          >
            <MoreHorizontal size={22} />
          </button>
          {showOptions && (
            <Options
              onSignInClick={() => {
                setShowOptions(false);
                setIsSignInModalOpen(true);
              }}
              onSignOutClick={handleSignOut}
            />
          )}
        </div>
        <SignInModal
          isOpen={isSignInModalOpen}
          onClose={() => setIsSignInModalOpen(false)}
        />
      </nav>
    );
  }

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
          {copied ? <CheckCheck size={20} color="green" /> : <Copy size={20} />}
        </button>

        <button
          onClick={() => setIsShareModalOpen(true)}
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

        <button
          onClick={()=> setIsRetrieveModalOpen(true)}
          className={"p-2 rounded-md transition-colors hover:bg-[#262626] cursor-pointer"}
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

          {showOptions && (
            <Options
              onSignInClick={() => {
                setShowOptions(false);
                setIsSignInModalOpen(true);
              }}
              onSignOutClick={handleSignOut}
            />
          )}
        </div>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)}
        note={note}
      />
      <RetrieveModal 
        isOpen={isRetrieveModalOpen} 
        onClose={() => setIsRetrieveModalOpen(false)} 
      />
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </nav>
  );
}
