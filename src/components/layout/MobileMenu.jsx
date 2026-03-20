import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { LogOut, Menu, X, ChevronRight } from "lucide-react";
import menu from "./menu";

const MobileMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [scrollDirection, setScrollDirection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll <= 0) {
        setScrollDirection("");
        return;
      }
      if (currentScroll > lastScroll && scrollDirection !== "down") setScrollDirection("down");
      else if (currentScroll < lastScroll && scrollDirection === "down") setScrollDirection("up");
      setLastScroll(currentScroll);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll, scrollDirection]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMenuOpen) setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Top Navbar */}
      <div className="lg:hidden">
        <nav
          className={`
          fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3
          bg-[#1a1c20]/95 backdrop-blur-md border-b border-[#2a2d33]
          transition-transform duration-300 shadow-lg shadow-black/30
          ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"}
        `}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md shadow-blue-900/40">
              <span className="text-white font-black text-xs">LP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-100 font-bold text-sm tracking-tight leading-none">
                LabPilot<span className="text-slate-500 font-light">Pro</span>
              </span>
              <span className="text-[9px] text-slate-500 font-medium">Health Management</span>
            </div>
          </Link>

          <button
            onClick={toggleMenu}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#22252b] hover:bg-[#2a2d35] border border-[#2a2d33] transition-all"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-4 h-4 text-slate-400" /> : <Menu className="w-4 h-4 text-slate-400" />}
          </button>
        </nav>
        <div className="h-[52px]" />
      </div>

      {/* Overlay */}
      {isMenuOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeMenu} />}

      {/* Slide-out Drawer */}
      <div
        className={`
        lg:hidden fixed top-0 right-0 h-full w-72 max-w-[85vw]
        bg-[#1a1c20] border-l border-[#2a2d33]
        z-50 shadow-2xl shadow-black/40
        transform transition-transform duration-300 ease-out
        ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex-shrink-0 px-5 py-5 border-b border-[#2a2d33]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                  <span className="text-white font-black text-sm">LP</span>
                </div>
                <div>
                  <p className="text-slate-100 font-bold text-sm tracking-tight leading-none">
                    LabPilot<span className="text-slate-500 font-light">Pro</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Professional Edition</p>
                </div>
              </div>
              <button
                onClick={closeMenu}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#22252b] hover:bg-[#2a2d35] border border-[#2a2d33] transition-all"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto px-3 py-3">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2 mt-1">
                Navigation
              </p>
              <div className="space-y-0.5">
                {menu.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                          isActive
                            ? "bg-[#252830] text-slate-100 border border-[#32363f]"
                            : "text-slate-500 hover:text-slate-200 hover:bg-[#22252b] border border-transparent"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150 ${
                              isActive
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-[#22252b] text-slate-500 group-hover:bg-[#2a2d35] group-hover:text-slate-300"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-sm flex-1 tracking-tight">{item.label}</span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 shrink-0 transition-all duration-150 ${
                              isActive ? "text-blue-400" : "text-slate-700 group-hover:text-slate-500"
                            }`}
                          />
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-3 border-t border-[#2a2d33]">
            <button
              onClick={closeMenu}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/15 transition-all duration-150 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#22252b] group-hover:bg-red-500/10 flex items-center justify-center shrink-0 transition-all duration-150">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-medium tracking-tight">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
