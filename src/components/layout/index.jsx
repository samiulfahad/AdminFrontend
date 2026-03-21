import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";
import { Zap } from "lucide-react";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="print:hidden">
        <MobileMenu />
      </div>
      <div className="print:hidden">
        <DesktopMenu />
      </div>

      <div className="flex-1 flex flex-col min-h-screen lg:ml-60 print:ml-0">
        <main className="flex-1 pt-14 lg:pt-0 print:pt-0 bg-slate-50">
          <div className="max-w-7xl mx-auto print:max-w-none">{children}</div>
        </main>

        <footer className="print:hidden bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 px-7 py-3.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-sm shadow-indigo-200">
                <Zap size={10} className="text-white" />
              </div>
              <span className="text-[11.5px] text-slate-400">
                © {new Date().getFullYear()} LabPilot Pro — All rights reserved
              </span>
            </div>
            <span className="text-[11.5px] text-slate-400">
              Designed &amp; Developed by <span className="text-indigo-500 font-bold">Samiul Fahad</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
