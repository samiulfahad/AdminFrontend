import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import menu from "./menu";

const DesktopMenu = () => {
  return (
    <nav className="hidden lg:flex w-64 fixed left-0 top-0 h-screen flex-col bg-[#1a1c20] border-r border-[#2a2d33] z-40">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-5 border-b border-[#2a2d33]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
            <span className="text-white font-black text-sm tracking-tight">LP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-100 font-bold text-sm tracking-tight leading-none">
              LabPilot<span className="text-slate-500 font-light">Pro</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">Health Management System</span>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-3 py-3">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2 mt-1">Navigation</p>
          <div className="space-y-0.5">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
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
                      {isActive && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />}
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
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/15 transition-all duration-150 group">
          <div className="w-8 h-8 rounded-lg bg-[#22252b] group-hover:bg-red-500/10 flex items-center justify-center shrink-0 transition-all duration-150">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-medium tracking-tight">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default DesktopMenu;
