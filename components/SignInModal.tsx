"use client";

import { X, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zustandStore } from "@/zustand/store";
import { saveUserToStorage } from "@/components/UserHydration";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ModalMode = "signin" | "create";

export interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn?: (email: string, password: string) => void | Promise<void>;
}

export default function SignInModal({
  isOpen,
  onClose,
  onSignIn,
}: SignInModalProps) {
  const router = useRouter();
  const { setUser } = zustandStore();
  const [mode, setMode] = useState<ModalMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setError("");
      setMode("signin");
    }
  }, [isOpen]);

  const validate = (): boolean => {
    if (!email.trim()) {
      setError("Please enter your email");
      return false;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      if (onSignIn) {
        await Promise.resolve(onSignIn(email.trim(), password));
        return;
      }

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Sign in failed");
      }

      if (data.user) {
        const u = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
        };
        setUser(u);
        saveUserToStorage(u);
        onClose();
        router.push("/admin");
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create account");
      }

      if (data.user) {
        const u = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
        };
        setUser(u);
        saveUserToStorage(u);
        onClose();
        router.push("/admin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setError("");
    setMode("signin");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      <div className="relative bg-[#18181B] rounded-xl shadow-lg w-[450px] max-w-[90vw] border border-white">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-white font-mono text-lg">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h2>
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
            {mode === "signin"
              ? "Enter your email and password"
              : "Enter your email and choose a password (min 6 characters)"}
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}
          <div className="mb-4 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  mode === "signin" ? handleSignIn() : handleCreateAccount();
                }
              }}
              placeholder="Email"
              className="w-full px-3 py-2 bg-black border border-white rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white placeholder:text-gray-500"
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div className="mb-6 relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  mode === "signin" ? handleSignIn() : handleCreateAccount();
                }
              }}
              placeholder="Password"
              className="w-full px-3 py-2 pr-10 bg-black border border-white rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white placeholder:text-gray-500"
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors hover:bg-[#262626] text-gray-400 hover:text-white"
              title={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <button
                onClick={mode === "signin" ? handleSignIn : handleCreateAccount}
                disabled={
                  loading ||
                  !email.trim() ||
                  !password ||
                  password.length < 6 ||
                  !EMAIL_REGEX.test(email.trim())
                }
                className="bg-white text-black px-4 py-2 rounded-lg font-mono text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? mode === "signin"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </div>
            <div className="border-t border-[#262626] pt-4">
              {mode === "signin" ? (
                <button
                  type="button"
                  onClick={() => setMode("create")}
                  className="text-gray-400 hover:text-white font-mono text-sm transition-colors"
                >
                  Don&apos;t have an account? Create account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-gray-400 hover:text-white font-mono text-sm transition-colors"
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
