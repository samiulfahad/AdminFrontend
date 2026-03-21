import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen" style={{ background: "#eef3f7", fontFamily: "'Geist', 'DM Sans', sans-serif" }}>
      <div className="print:hidden">
        <MobileMenu />
      </div>
      <div className="print:hidden">
        <DesktopMenu />
      </div>

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 print:ml-0">
        <main className="flex-1 pt-[52px] lg:pt-0 print:pt-0" style={{ background: "#eef3f7" }}>
          <div className="max-w-7xl mx-auto print:max-w-none">{children}</div>
        </main>

        <footer className="print:hidden" style={{ borderTop: "1px solid #dde6ee", background: "#fff" }}>
          <div
            style={{
              maxWidth: "80rem",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 32px",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  background: "linear-gradient(135deg, #0d9488, #0f766e)",
                  borderRadius: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(13,148,136,0.3)",
                }}
              >
                <span style={{ fontSize: 7.5, fontWeight: 800, color: "#fff" }}>LP</span>
              </div>
              <span style={{ fontSize: 11.5, color: "#8fafc4" }}>
                © {new Date().getFullYear()} LabPilot Pro — All rights reserved
              </span>
            </div>
            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
              Designed & Developed by <span style={{ color: "#0d9488", fontWeight: 600 }}>Samiul Fahad</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
