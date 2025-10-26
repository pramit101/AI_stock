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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-purple-700 dark:text-purple-400 text-center mb-8">
          {t("settings")}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Information */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Account Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t("name")}:</span>
                  <p className="text-gray-600 dark:text-gray-400">{userData?.firstName || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t("email")}:</span>
                  <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t("accountCreated")}:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {userData?.createdAt
                      ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                  {t("changePassword")}
                </h4>
                <input
                  type="password"
                  placeholder={t("changePassword")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent mb-3"
                />
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {t("updatePassword")}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-medium text-red-600 dark:text-red-400 mb-3">
                  {t("dangerZone")}
                </h4>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {t("deleteAccount")}
                </button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("language")}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => updateSetting("language", e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("fontSize")}
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => updateSetting("fontSize", e.target.value as any)}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  >
                    <option value="small">{t("fontSmall")}</option>
                    <option value="medium">{t("fontMedium")}</option>
                    <option value="large">{t("fontLarge")}</option>
                    <option value="x-large">{t("fontXLarge")}</option>
                  </select>
                </div>

                {/* Font Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("fontStyle")}
                  </label>
                  <select
                    value={fontStyle}
                    onChange={(e) => updateSetting("fontStyle", e.target.value as any)}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
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
              </div>

              {/* Location */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                  📍 Location
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("country")}
                    </label>
                    <input
                      list="countries"
                      value={countryName}
                      onChange={handleCountryChange}
                      placeholder={t("startTypingCountry")}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    />
                    <datalist id="countries">
                      {allCountries.map((c: Country) => (
                        <option key={c.code} value={c.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("postcode")}
                    </label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={handlePostcodeChange}
                      className={`w-full p-3 rounded-lg border ${
                        postcodeValid 
                          ? "border-gray-300 dark:border-gray-600" 
                          : "border-red-500 dark:border-red-400"
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent`}
                      placeholder={t("enterPostcode")}
                    />
                    {!postcodeValid && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                        ❌ {t("invalidPostcode")}
                      </p>
                    )}
                  </div>
                </div>

                {places.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("state")}
                    </label>
                    <select
                      value={selectedPlace}
                      onChange={(e) => setSelectedPlace(e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    >
                      <option value="">{t("selectState")}</option>
                      {places.map((p, i) => (
                        <option key={i} value={p.value}>
                          {p.display}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Reset Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleReset}
                  className="w-full bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white py-3 px-6 rounded-lg shadow hover:shadow-lg transition-all duration-200"
                >
                  {t("reset")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
