import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase"; // Firestore instance
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isValidName = (name: string) => /^[A-Za-z]{2,}$/.test(name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (isSignup) {
      if (!isValidName(firstName) || !isValidName(lastName)) {
        setError(
          "First and last names can only contain letters and must be at least 2 characters."
        );
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          email,
          createdAt: new Date(),
        });

        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
        });

        setMessage("Account created!");

        setTimeout(() => {
          setIsSignup(false);
          setMessage("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setFirstName("");
          setLastName("");
        }, 1500);
      } else if (forgotPasswordMode) {
        if (!email) {
          setError("Please enter your email first.");
          return;
        }
        await sendPasswordResetEmail(auth, email);
        setMessage(
          "If an account with that email exists, a reset email has been sent."
        );
        setForgotPasswordMode(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/"); // dashboard
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForgotPassword = () => {
    setForgotPasswordMode(false);
    setError("");
    setMessage("");
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 font-sans">
      {/* Project title */}
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Pentavision</h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Form header */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {forgotPasswordMode
            ? "Reset Password"
            : isSignup
            ? "Create Account"
            : "Login"}
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}
        {message && (
          <p className="text-green-500 text-sm mb-2 text-center">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Signup fields */}
          {isSignup && !forgotPasswordMode && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value.replace(/[^A-Za-z]/g, ""))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value.replace(/[^A-Za-z]/g, ""))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}

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

          {/* Password fields */}
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

              {isSignup && (
                <div>
                  <label className="block text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e40af] text-white py-2 rounded-lg hover:bg-blue-800 transition"
              >
                {loading
                  ? "Please wait..."
                  : isSignup
                  ? "Sign Up"
                  : "Login"}
              </button>
            </>
          )}

          {forgotPasswordMode && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#1e40af] text-white py-2 rounded-lg hover:bg-blue-800 transition"
            >
              {loading ? "Please wait..." : "Reset Password"}
            </button>
          )}
        </form>

        {/* Bottom buttons stacked full width */}
        <div className="mt-4 flex flex-col gap-2">
          {!forgotPasswordMode && !isSignup && (
            <button
              onClick={() => {
                setForgotPasswordMode(true);
                setError("");
                setMessage("");
              }}
              className="w-full text-[#1e40af] hover:underline bg-transparent border-none p-2 rounded cursor-pointer"
            >
              Forgot password?
            </button>
          )}

          {!forgotPasswordMode && (
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="w-full text-[#1e40af] hover:underline bg-transparent border-none p-2 rounded cursor-pointer"
            >
              {isSignup
                ? "Already have an account? Login"
                : "Create an account"}
            </button>
          )}

          {forgotPasswordMode && (
            <button
              onClick={handleCancelForgotPassword}
              className="w-full text-[#1e40af] hover:underline bg-transparent border-none p-2 rounded cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
