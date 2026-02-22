import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../context/AuthContext";
import { useTheme, ACCENT_COLORS } from "../context/ThemeContext";
import { updateAdminProfile } from "../apis/admin";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";

export default function Profile() {
  const { user, token, updateProfile } = useAuth();
  const { accentColor, setAccentColor } = useTheme();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePhoto || "");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Sync state when user changes (after successful update)
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
      });
      setPreviewUrl(user.profilePhoto || "");
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    if (formData.name) data.append("name", formData.name);
    if (formData.email) data.append("email", formData.email);
    if (formData.password) data.append("password", formData.password);
    if (selectedFile) data.append("profilePhoto", selectedFile);

    try {
      const adminId = user?._id;
      // console.log("Updating Admin ID:", adminId);

      if (!adminId) {
        throw new Error("Admin ID not found. Please logout and login again.");
      }

      const responseData = await updateAdminProfile(adminId, data);
      // console.log("Update Success:", responseData);

      updateProfile(responseData.admin);
      toast.success("Profile updated successfully!");
      setFormData((prev) => ({ ...prev, password: "" }));
      setSelectedFile(null);

      // Redirect to dashboard after 1 second delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      // console.error("Profile Update Error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Admin Profile | GRS Admin"
        description="View and update your admin profile"
      />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Profile
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your account settings and profile information
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {/* Profile Photo Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-gray-100 dark:border-gray-700">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-50 dark:border-gray-700 shadow-sm">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-50 flex items-center justify-center text-brand-500 text-3xl font-bold">
                      {formData.name.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile Picture
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  PNG, JPG or GIF. Max 2MB.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>

            {/* ── Accent Color Picker ── */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Accent Color
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Choose a brand color — all highlights, buttons and accents
                  will update instantly.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.label}
                    onClick={() => setAccentColor(c.id)}
                    className="relative w-10 h-10 rounded-full border-2 transition-all focus:outline-none"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: accentColor === c.id ? c.hex : "transparent",
                      boxShadow:
                        accentColor === c.id ? `0 0 0 3px ${c.hex}40` : "none",
                    }}
                  >
                    {accentColor === c.id && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Currently:{" "}
                <span className="font-semibold text-brand-500">
                  {ACCENT_COLORS.find((c) => c.id === accentColor)?.label}
                </span>
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium shadow-sm transition-all disabled:opacity-70 flex items-center gap-2"
              >
                {loading ? (
                  <Loader size="h-5 w-5" className="text-white" />
                ) : null}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
