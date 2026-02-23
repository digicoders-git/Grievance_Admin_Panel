import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSidebar } from "../../context/SidebarContext";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import { useTheme, ACCENT_COLORS } from "../../context/ThemeContext";
import UserDropdown from "./UserDropdown";
import { fetchStudents } from "../../apis/student";
import { fetchOfficers } from "../../apis/officer";
import { fetchAdminGrievances } from "../../apis/admin";
import { useNavigate } from "react-router";

const AppHeader = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [isColorPickerOpen, setColorPickerOpen] = useState(false);
  const colorPickerRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { accentColor, setAccentColor } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const {
    isExpanded,
    isHovered,
    isMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
  } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 991) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef(null);

  // Close search results on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target)
      ) {
        setColorPickerOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Search Logic (Debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = searchQuery.toLowerCase();
        const results = [];

        // 1. Fetch Students
        const studentsData = await fetchStudents({ search: query, limit: 5 });
        if (studentsData?.students?.length > 0) {
          results.push({
            title: "Students",
            items: studentsData.students.map((s) => ({
              label: s.name,
              subLabel: `EN: ${s.enrollmentNumber} | ${s.branch}`,
              link: "/students",
              type: "student",
            })),
          });
        }

        // 2. Fetch Officers
        const officersData = await fetchOfficers({ search: query, limit: 5 });
        if (officersData?.officers?.length > 0) {
          results.push({
            title: "Officers",
            items: officersData.officers.map((o) => ({
              label: o.name,
              subLabel: `${o.designation} | ${o.department}`,
              link: "/officers",
              type: "officer",
            })),
          });
        }

        // 3. Fetch Grievances
        const grievancesData = await fetchAdminGrievances({
          search: query,
          limit: 5,
        });
        if (grievancesData?.grievances?.length > 0) {
          results.push({
            title: "Grievances",
            items: grievancesData.grievances.map((g) => ({
              label: g.subject,
              subLabel: `ID: #${g._id.slice(-6).toUpperCase()} | ${g.status}`,
              link: `/grievance/${g._id}`,
              type: "grievance",
            })),
          });
        }

        // 4. Commands / Navigation
        const commands = [
          { label: "Dashboard Overview", link: "/dashboard" },
          { label: "Add New Student", link: "/students" },
          { label: "Add New Officer", link: "/officers" },
          { label: "Admin Profile Settings", link: "/profile" },
          { label: "Export Student List", link: "/students" },
        ].filter((cmd) => cmd.label.toLowerCase().includes(query));

        if (commands.length > 0) {
          results.push({
            title: "Quick Commands",
            items: commands.map((c) => ({ ...c, type: "command" })),
          });
        }

        setSearchResults(results);
        setIsSearchOpen(true);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 z-[999] flex bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
        isMobileOpen
          ? "left-0"
          : isExpanded || isHovered
            ? "lg:left-[290px]"
            : "lg:left-[90px]"
      } left-0`}
    >
      <div className="flex flex-col items-center justify-between flex-grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 sm:gap-4 lg:justify-normal lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          <Link to="/" className="lg:hidden flex items-center gap-2">
            {/* <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                  fill="white"
                />
              </svg>
            </div> */}
            <span className="text-base font-bold text-gray-800 dark:text-white tracking-tight">
              GRS{" "}
              <span className="text-blue-600 dark:text-blue-400">Admin</span>
            </span>
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="hidden lg:block relative" ref={searchRef}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2 text-gray-400">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                  placeholder="Search students, officers, grievances..."
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px] transition-all"
                />

                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {isSearching && (
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 bg-gray-50/50 dark:bg-white/[0.02]">
                      ⌘
                    </span>
                    <span className="px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 bg-gray-50/50 dark:bg-white/[0.02]">
                      K
                    </span>
                  </div>
                </div>
              </div>
            </form>

            {/* Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[9999]">
                <div className="max-h-[70vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                  {searchResults.map((category, idx) => (
                    <div key={idx} className="mb-4 last:mb-0">
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between">
                        {category.title}
                        <span className="px-1.5 py-0.5 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-[9px]">
                          {category.items.length}
                        </span>
                      </p>
                      <div className="space-y-1 mt-1">
                        {category.items.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              navigate(item.link);
                              setIsSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors shrink-0">
                              {item.type === "student" && (
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
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                              )}
                              {item.type === "officer" && (
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
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              )}
                              {item.type === "grievance" && (
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
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="16" y1="13" x2="8" y2="13" />
                                </svg>
                              )}
                              {item.type === "command" && (
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
                                  <polyline points="4 17 10 11 4 5" />
                                  <line x1="12" y1="19" x2="20" y2="19" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {item.label}
                              </p>
                              {item.subLabel && (
                                <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                  {item.subLabel}
                                </p>
                              )}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-[10px] text-gray-400 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800">
                        Enter
                      </span>
                      select
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800 text-[8px]">
                        ↑↓
                      </span>
                      navigate
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800">
                      Esc
                    </span>
                    close
                  </span>
                </div>
              </div>
            )}

            {isSearchOpen &&
              searchQuery.trim() &&
              !isSearching &&
              searchResults.length === 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-2xl p-8 text-center animate-in fade-in slide-in-from-top-2 duration-200 z-[9999]">
                  <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mx-auto mb-3">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gray-400"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    No matches found
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Try searching for ID, name or department
                  </p>
                </div>
              )}
          </div>
        </div>
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />

            {/* ── Accent Color Picker ── */}
            <div className="relative" ref={colorPickerRef}>
              <button
                onClick={() => setColorPickerOpen((p) => !p)}
                className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title="Accent Color"
                aria-label="Change accent color"
              >
                {/* Paint Palette SVG */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"
                    fill="currentColor"
                    opacity="0.15"
                  />
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" />
                  <circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" />
                  <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" />
                  <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" />
                </svg>
              </button>

              {/* Dropdown */}
              {isColorPickerOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-4 z-[99999]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                    Accent Color
                  </p>
                  <div className="grid grid-cols-6 gap-2.5">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setAccentColor(c.id);
                          setColorPickerOpen(false);
                        }}
                        title={c.label}
                        className="relative w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none"
                        style={{
                          backgroundColor: c.hex,
                          boxShadow:
                            accentColor === c.id
                              ? `0 0 0 3px ${c.hex}50`
                              : "none",
                          border:
                            accentColor === c.id
                              ? `2px solid ${c.hex}`
                              : "2px solid transparent",
                        }}
                      >
                        {accentColor === c.id && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3.5"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-3">
                    <span
                      className="font-semibold"
                      style={{
                        color: ACCENT_COLORS.find((c) => c.id === accentColor)
                          ?.hex,
                      }}
                    >
                      {ACCENT_COLORS.find((c) => c.id === accentColor)?.label}
                    </span>{" "}
                    selected
                  </p>
                </div>
              )}
            </div>
          </div>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
