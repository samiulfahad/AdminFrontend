import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import menu from "./menu";

const DesktopMenu = () => {
  return (
    <nav
      className="hidden lg:flex w-64 fixed left-0 top-0 h-screen flex-col z-40"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafb 100%)",
        borderRight: "1px solid #e1e8ef",
        fontFamily: "'Geist', 'DM Sans', sans-serif",
        boxShadow: "2px 0 12px rgba(15,40,55,0.05)",
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
          background: "linear-gradient(90deg, #0d9488 0%, #14b8a6 50%, #5eead4 100%)",
          borderRadius: "0 0 0 0",
        }}
      />

      {/* Subtle teal glow at top-left */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 160,
          height: 160,
          background: "radial-gradient(circle at 0% 0%, rgba(13,148,136,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ flexShrink: 0, padding: "26px 20px 18px", borderBottom: "1px solid #eaf0f5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
              borderRadius: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(13,148,136,0.35), 0 1px 3px rgba(0,0,0,0.1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
              }}
            />
            <span
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: "-0.5px",
                position: "relative",
                zIndex: 1,
              }}
            >
              LP
            </span>
          </div>
          <div>
            <div style={{ color: "#0f2537", fontWeight: 700, fontSize: 14, letterSpacing: "-0.5px", lineHeight: 1 }}>
              LabPilot<span style={{ color: "#94a3b8", fontWeight: 300 }}>Pro</span>
            </div>
            <div
              style={{
                fontSize: 9.5,
                color: "#94a3b8",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              Health Management
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ height: "100%", overflowY: "auto", padding: "14px 10px", scrollbarWidth: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} end={item.path === "/"} style={{ textDecoration: "none" }}>
                  {({ isActive }) => (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        padding: "9px 11px",
                        borderRadius: 10,
                        position: "relative",
                        cursor: "pointer",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(13,148,136,0.09) 0%, rgba(13,148,136,0.04) 100%)"
                          : "transparent",
                        border: isActive ? "1px solid rgba(13,148,136,0.18)" : "1px solid transparent",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "#f0f7f6";
                          e.currentTarget.style.border = "1px solid #e0eeec";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.border = "1px solid transparent";
                        }
                      }}
                    >
                      {/* Active left indicator */}
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
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Icon
                          style={{
                            width: 14,
                            height: 14,
                            color: isActive ? "#0d9488" : "#8fafc4",
                            transition: "color 0.15s",
                          }}
                        />
                      </div>

                      <span
                        style={{
                          fontSize: 13,
                          flex: 1,
                          letterSpacing: "-0.15px",
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "#0f2537" : "#64829a",
                          transition: "color 0.15s",
                        }}
                      >
                        {item.label}
                      </span>

                      {isActive && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#0d9488",
                            flexShrink: 0,
                            boxShadow: "0 0 0 2.5px rgba(13,148,136,0.2)",
                          }}
                        />
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* User + Logout */}
      <div style={{ flexShrink: 0, borderTop: "1px solid #eaf0f5" }}>
        <div style={{ padding: "8px 10px 12px" }}>
          <button
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
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.05)";
              e.currentTarget.style.border = "1px solid rgba(239,68,68,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.border = "1px solid transparent";
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
    </nav>
  );
};

export default DesktopMenu;
