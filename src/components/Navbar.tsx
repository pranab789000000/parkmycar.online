/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { LogOut, LayoutDashboard, Home, User as UserIcon } from "lucide-react";
import { logout } from "../lib/firebase";

export default function Navbar({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const isAdmin = user?.email === "pranab789000000@gmail.com";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-slate-900 text-white p-1.5 rounded-lg group-hover:bg-slate-800 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-xl font-display font-bold text-slate-900">ParkMyCar<span className="text-blue-600">.online</span></span>
          {isAdmin && (
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded-full tracking-widest border border-red-200">
              Admin
            </span>
          )}
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            <Home className="w-4 h-4" /> Home
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                id="logout-button"
              >
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                 {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "User"} referrerPolicy="no-referrer" />
                 ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                    </div>
                 )}
              </div>
            </>
          ) : (
            <Link to="/auth" className="btn-primary flex items-center gap-2">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
