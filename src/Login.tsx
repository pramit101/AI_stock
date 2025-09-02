import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/"); // redirect to dashboard
    } catch (err: any) {
      setError("Invalid email or password."); // safe generic error
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "If an account with that email exists, a reset email has been sent."
      );
      setError("");
      setForgotPasswordMode(false);
    } catch {
      setMessage(
        "If an account with that email exists, a reset email has been sent."
      );
      setError("");
    }
  };

  const handleCancelForgotPassword = () => {
    setForgotPasswordMode(false);
    setError("");
    setMessage("");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {forgotPasswordMode
            ? "Reset Password"
            : isSignup
            ? "Sign Up"
            : "Login"}
        </h1>

        {/* Safe error and message display */}
        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}
        {message && (
          <p className="text-green-500 text-sm mb-2 text-center">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {!forgotPasswordMode && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1e40af] text-white py-2 rounded-lg hover:bg-blue-800 transition"
              >
                {isSignup ? "Sign Up" : "Login"}
              </button>
            </>
          )}

          {forgotPasswordMode && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full bg-[#1e40af] text-white py-2 rounded-lg hover:bg-blue-800 transition"
            >
              Reset Password
            </button>
          )}
        </form>

        <div className="flex justify-between mt-4 text-sm">
          {!forgotPasswordMode && (
            <button
              onClick={() => {
                setForgotPasswordMode(true);
                setError("");
                setMessage("");
              }}
              className="text-[#1e40af] hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Forgot password?
            </button>
          )}

          {!forgotPasswordMode && (
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-[#1e40af] hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          )}

          {forgotPasswordMode && (
            <button
              onClick={handleCancelForgotPassword}
              className="text-[#1e40af] hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
