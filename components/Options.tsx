"use client";

import { toggleFullscreen, clearPage } from "../hooks/useKeyboardShortcuts";
import { zustandStore } from '../zustand/store';

type OptionsProps = {
  onSignInClick?: () => void;
  onSignOutClick?: () => void;
};

export default function Options({ onSignInClick, onSignOutClick }: OptionsProps) {
  const { token, user } = zustandStore();
  const isSignedIn = !!user;

  return (
    <div className="absolute right-0 mt-2 w-60 px-2 py-2 bg-black border border-gray-400 rounded-md shadow-lg z-50">
      
      <div className="flex justify-between items-center w-full text-left px-4 py-2 text-xs rounded-md hover:bg-[#262626]">
        <span className="text-amber-500 font-mono py-1 px-2 bg-[#18181B] rounded">Token</span>
        <span className="text-amber-500 font-mono py-1 px-2 bg-[#18181B] rounded">{token}</span>
      </div>

      <button className="flex justify-between items-center w-full text-left px-4 py-2 text-xs rounded-md hover:bg-[#262626]"
      onClick={clearPage}
      >
        <span className="text-white font-mono">Clear page</span>
        <span className="text-gray-400 font-mono">ctrl+alt+c</span>
      </button>
      
      <button className="flex justify-between items-center w-full text-left px-4 py-2 text-xs rounded-md hover:bg-[#262626]">
        <span className="text-white font-mono">Light theme</span>
        <span className="text-gray-400 font-mono">ctrl+alt+l</span>
      </button>

      <button
        className="flex justify-between items-center w-full text-left px-4 py-2 text-xs rounded-md hover:bg-[#262626]"
        onClick={toggleFullscreen}
      >
        <span className="text-white font-mono">Full screen</span>
        <span className="text-gray-400 font-mono">F11</span>
      </button>

      {isSignedIn ? (
        <button
          className="block w-full text-left px-4 py-2 text-xs font-mono rounded-md hover:bg-[#262626]"
          onClick={onSignOutClick}
        >
          Sign out
        </button>
      ) : (
        <button
          className="block w-full text-left px-4 py-2 text-xs font-mono rounded-md hover:bg-[#262626]"
          onClick={onSignInClick}
        >
          Sign in
        </button>
      )}
    </div>
  );
}
