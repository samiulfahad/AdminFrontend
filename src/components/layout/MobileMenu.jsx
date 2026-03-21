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

  const hidden = scrollDirection === "down";

  return (
    <>
      <div className="lg:hidden">
        {/* Teal accent bar */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            zIndex: 51,
            background: "linear-gradient(90deg, #0d9488, #14b8a6 55%, #5eead4)",
            transition: "transform 0.3s ease",
            transform: hidden ? "translateY(-200%)" : "translateY(0)",
          }}
        />

        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            height: 52,
            background: "#ffffff",
            borderBottom: "1px solid #e1e8ef",
            boxShadow: "0 1px 10px rgba(15,40,55,0.07)",
            transition: "transform 0.3s ease",
            transform: hidden ? "translateY(-100%)" : "translateY(0)",
            fontFamily: "'Geist', 'DM Sans', sans-serif",
          }}
        >
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                background: "linear-gradient(135deg, #0d9488, #0f766e)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 10px rgba(13,148,136,0.32)",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 10 }}>LP</span>
            </div>
            <div>
              <div style={{ color: "#0f2537", fontWeight: 700, fontSize: 13, letterSpacing: "-0.4px", lineHeight: 1 }}>
                LabPilot<span style={{ color: "#94a3b8", fontWeight: 300 }}>Pro</span>
              </div>
              <div
                style={{
                  fontSize: 8.5,
                  color: "#94a3b8",
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  marginTop: 3,
                }}
              >
                Health Mgmt
              </div>
            </div>
          </Link>

          <button
            onClick={toggleMenu}
            style={{
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9,
              background: "#f0f4f7",
              border: "1px solid #e1e8ef",
              cursor: "pointer",
            }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X style={{ width: 14, height: 14, color: "#64829a" }} />
            ) : (
              <Menu style={{ width: 14, height: 14, color: "#64829a" }} />
            )}
          </button>
        </nav>
        <div style={{ height: 52 }} />
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden"
          onClick={closeMenu}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(15,37,55,0.3)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Drawer */}
      <div
        className="lg:hidden"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: 284,
          maxWidth: "85vw",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafb 100%)",
          borderLeft: "1px solid #e1e8ef",
          zIndex: 50,
          boxShadow: "-14px 0 50px rgba(15,40,55,0.12)",
          transform: isMenuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Geist', 'DM Sans', sans-serif",
        }}
      >
        {/* Teal top accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #0d9488, #14b8a6 55%, #5eead4)",
          }}
        />

        {/* Teal ambient glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 140,
            height: 140,
            background: "radial-gradient(circle at 100% 0%, rgba(13,148,136,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div style={{ flexShrink: 0, padding: "24px 18px 16px", borderBottom: "1px solid #eaf0f5" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  background: "linear-gradient(135deg, #0d9488, #0f766e)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(13,148,136,0.35)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)",
                  }}
                />
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 12, position: "relative", zIndex: 1 }}>
                  LP
                </span>
              </div>
              <div>
                <div
                  style={{ color: "#0f2537", fontWeight: 700, fontSize: 13.5, letterSpacing: "-0.4px", lineHeight: 1 }}
                >
                  LabPilot<span style={{ color: "#94a3b8", fontWeight: 300 }}>Pro</span>
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "#94a3b8",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  Professional Edition
                </div>
              </div>
            </div>
            <button
              onClick={closeMenu}
              style={{
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                background: "#f0f4f7",
                border: "1px solid #e1e8ef",
                cursor: "pointer",
              }}
            >
              <X style={{ width: 13, height: 13, color: "#64829a" }} />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          <p
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              color: "#c8d6e0",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "0 10px",
              marginBottom: 8,
            }}
          >
            Main Menu
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeMenu}
                  style={{ textDecoration: "none" }}
                >
                  {({ isActive }) => (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        padding: "9px 11px",
                        borderRadius: 10,
                        position: "relative",
                        background: isActive ? "rgba(13,148,136,0.07)" : "transparent",
                        border: isActive ? "1px solid rgba(13,148,136,0.18)" : "1px solid transparent",
                      }}
                    >
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: "22%",
                            bottom: "22%",
                            width: 3,
                            background: "linear-gradient(180deg, #0d9488, #14b8a6)",
                            borderRadius: "0 3px 3px 0",
                          }}
                        />
                      )}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: isActive ? "rgba(13,148,136,0.12)" : "#f0f4f7",
                          border: isActive ? "1px solid rgba(13,148,136,0.22)" : "1px solid #e4ecf1",
                        }}
                      >
                        <Icon style={{ width: 14, height: 14, color: isActive ? "#0d9488" : "#8fafc4" }} />
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          flex: 1,
                          letterSpacing: "-0.15px",
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "#0f2537" : "#64829a",
                        }}
                      >
                        {item.label}
                      </span>
                      <ChevronRight
                        style={{ width: 13, height: 13, color: isActive ? "#0d9488" : "#d4e0e9", flexShrink: 0 }}
                      />
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, borderTop: "1px solid #eaf0f5" }}>
          <div style={{ padding: "8px 10px 12px" }}>
            <button
              onClick={closeMenu}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 11px",
                borderRadius: 9,
                background: "transparent",
                border: "1px solid transparent",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#f0f4f7",
                  border: "1px solid #e4ecf1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LogOut style={{ width: 13, height: 13, color: "#8fafc4" }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#64829a" }}>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
