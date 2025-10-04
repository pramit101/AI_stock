import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { updatePassword, deleteUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{
    firstName?: string;
    email?: string;
    createdAt?: Timestamp;
  }>({});
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Load user info from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setUserData(
            snapshot.data() as {
              firstName?: string;
              email?: string;
              createdAt?: Timestamp;
            }
          );
        }
      }
    };
    fetchUserData();
  }, [user]);

  // Change password
  const handleChangePassword = async () => {
    if (!user || !newPassword) return;
    try {
      setLoading(true);
      await updatePassword(user, newPassword);
      alert("Password updated successfully!");
      setNewPassword("");
      navigate("/");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmation = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (!confirmation) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      alert("Your account has been deleted.");
      navigate("/");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        margin: "2rem auto",
        padding: "1.5rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Settings</h2>

      {/* Display user info */}
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ paddingBottom: "0.5rem" }}>
          <strong>Name:</strong> {userData?.firstName || "N/A"}
        </p>
        <p style={{ paddingBottom: "0.5rem" }}>
          <strong>Email:</strong> {user?.email}
        </p>
        <p style={{ paddingBottom: "0.5rem" }}>
          <strong>Account created on: </strong>
          {userData?.createdAt
            ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      {/* Change password */}
      <div style={{ marginBottom: "1.5rem", maxWidth: "400px" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
          Change Password
        </h3>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{
            padding: "0.5rem",
            width: "100%",
            marginBottom: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={handleChangePassword}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Update Password
        </button>
      </div>

      {/* Delete account */}
      <div>
        <h3
          style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "red" }}
        >
          Danger Zone
        </h3>
        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
