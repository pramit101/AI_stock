import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { updatePassword, deleteUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useTranslation } from "react-i18next";
import countryList, { Country } from "country-list";

interface LocationPlace {
  state: string;
  "place name": string;
}

interface PlaceOption {
  display: string;
  value: string;
}

const Settings: React.FC = () => {
  const { language, fontSize, fontStyle, updateSetting, resetSettings } =
    useSettings();

  const { t } = useTranslation();

  const [postcode, setPostcode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [places, setPlaces] = useState<PlaceOption[]>([]);
  const [postcodeValid, setPostcodeValid] = useState(true);

  const allCountries = countryList.getData();

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCountryName(e.target.value);
    setSelectedPlace("");
    setPlaces([]);
    setPostcodeValid(true);
  };

  const handlePostcodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.trim();
    setPostcode(value);
    setSelectedPlace("");
    setPlaces([]);

    if (!value || !countryName) {
      setPostcodeValid(true);
      return;
    }

    const countryCode = countryList.getCode(countryName);

    if (!countryCode) {
      setPostcodeValid(false);
      return;
    }

    try {
      const res = await fetch(
        `https://api.zippopotam.us/${countryCode}/${value}`
      );
      if (res.ok) {
        const data = await res.json();

        const placeOptions: PlaceOption[] = data.places.map(
          (p: LocationPlace) => ({
            display: `${p["place name"]} (${p.state})`,
            value: `${p["place name"]}, ${p.state}`,
          })
        );

        setPlaces(placeOptions);
        setPostcodeValid(true);
      } else {
        setPlaces([]);
        setPostcodeValid(false);
      }
    } catch (err) {
      console.error("Error fetching postcode:", err);
      setPostcodeValid(false);
    }
  };

  const handleReset = () => {
    resetSettings();
    setPostcode("");
    setCountryName("");
    setSelectedPlace("");
    setPlaces([]);
    setPostcodeValid(true);
  };

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
    <>
      <h2 className="text-3xl font-bold text-purple-700 w-full text-center mb-6">
        {t("settings")}
      </h2>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex justify-between p-6 space-x-6">
        <div className="bg-white shadow-xl rounded-3xl w-1/3 p-8 space-y-6">
          {/* Display user info */}
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ paddingBottom: "0.5rem" }}>
              <strong>{t("name")}:</strong> {userData?.firstName || "N/A"}
            </p>
            <p style={{ paddingBottom: "0.5rem" }}>
              <strong>{t("email")}: </strong> {user?.email}
            </p>
            <p style={{ paddingBottom: "0.5rem" }}>
              <strong>{t("accountCreated")}: </strong>
              {userData?.createdAt
                ? new Date(
                    userData.createdAt.seconds * 1000
                  ).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          {/* Change password */}
          <div
            style={{
              marginBottom: "1.5rem",
              maxWidth: "400px",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              {t("changePassword")}
            </h3>
            <input
              type="password"
              placeholder={t("changePassword")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                padding: "0.5rem",
                width: "100%",
                marginBottom: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "#f9f9f9",
              }}
            />
            <button
              onClick={handleChangePassword}
              disabled={loading}
              style={{
                padding: "0.5rem 1rem",
                color: "white",
                border: "none",
                backgroundColor: "#6b46c1",
                borderRadius: "4px",
              }}
            >
              {t("updatePassword")}
            </button>
          </div>

          {/* Delete account */}
          <div>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
                color: "red",
              }}
            >
              {t("dangerZone")}
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
              {t("deleteAccount")}
            </button>
          </div>
        </div>
        <div className="bg-white shadow-xl rounded-3xl w-2/3 p-8 space-y-6">
          <div>
            <div>
              {/* Language */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">
                  {t("language")}
                </label>
                <select
                  value={language}
                  onChange={(e) => updateSetting("language", e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400"
                >
                  <option value="en">{t("langEnglish")}</option>
                  <option value="zh">{t("langMandarin")}</option>
                  <option value="es">{t("langSpanish")}</option>
                  <option value="fr">{t("langFrench")}</option>
                  <option value="ar">Arabic</option>
                  <option value="pt">Portuguese</option>
                  <option value="ru">Russian</option>
                  <option value="ja">Japanese</option>
                  <option value="de">German</option>
                  <option value="hi">{t("langHindi")}</option>
                  <option value="sw">Swahili</option>
                  <option value="ne">Nepali</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">
                  {t("fontSize")}
                </label>
                <select
                  value={fontSize}
                  onChange={(e) =>
                    updateSetting("fontSize", e.target.value as any)
                  }
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400"
                >
                  <option value="small">{t("fontSmall")}</option>
                  <option value="medium">{t("fontMedium")}</option>
                  <option value="large">{t("fontLarge")}</option>
                  <option value="x-large">{t("fontXLarge")}</option>
                </select>
              </div>

              {/* Font Style */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">
                  {t("fontStyle")}
                </label>
                <select
                  value={fontStyle}
                  onChange={(e) =>
                    updateSetting("fontStyle", e.target.value as any)
                  }
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400"
                >
                  <option>Arial</option>
                  <option>Verdana</option>
                  <option>Helvetica</option>
                  <option>Tahoma</option>
                  <option>Trebuchet MS</option>
                  <option>Times New Roman</option>
                  <option>Georgia</option>
                  <option>Garamond</option>
                  <option>Courier New</option>
                  <option>Brush Script MT</option>
                  <option>Comic Sans MS</option>
                  <option>Impact</option>
                  <option>Lucida Console</option>
                  <option>Palatino</option>
                  <option>Sans-serif</option>
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">
                  📍 {t("country")}
                </label>
                <input
                  list="countries"
                  value={countryName}
                  onChange={handleCountryChange}
                  placeholder={t("startTypingCountry")}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400"
                />
                <datalist id="countries">
                  {allCountries.map((c: Country) => (
                    <option key={c.code} value={c.name} />
                  ))}
                </datalist>

                <label className="block font-semibold text-gray-700 mt-3">
                  {t("postcode")}
                </label>
                <input
                  type="text"
                  value={postcode}
                  onChange={handlePostcodeChange}
                  className={`w-full p-3 rounded-xl border ${
                    postcodeValid ? "border-gray-300" : "border-red-500"
                  } focus:ring-2 focus:ring-purple-400`}
                  placeholder={t("enterPostcode")}
                />
                {!postcodeValid && (
                  <p className="text-red-500 text-sm">
                    ❌ {t("invalidPostcode")}
                  </p>
                )}

                {places.length > 0 && (
                  <>
                    <label className="block font-semibold text-gray-700 mt-2">
                      {t("state")}
                    </label>
                    <select
                      value={selectedPlace}
                      onChange={(e) => setSelectedPlace(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="">{t("selectState")}</option>
                      {places.map((p, i) => (
                        <option key={i} value={p.value}>
                          {p.display}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded-2xl shadow hover:bg-purple-600 transition"
              >
                {t("reset")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
