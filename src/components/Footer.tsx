/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, ShieldCheck, Mail, Github, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-bold text-slate-900">ParkMyCar<span className="text-blue-600">.online</span></span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Empowering car owners with privacy-first QR contact systems. No numbers revealed, just simple alerts.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link to="/#features" className="hover:text-slate-900 transition-colors">Features</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-slate-900 transition-colors">How it works</Link></li>
              <li><Link to="/auth" className="hover:text-slate-900 transition-colors">Get Started</Link></li>
              <li><Link to="/dashboard" className="hover:text-slate-900 transition-colors">User Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors italic">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors italic">Terms of Service</a></li>
              <li><a href="mailto:support@parkmycar.online" className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                <Mail className="w-4 h-4" /> Contact Support
              </a></li>
            </ul>
          </div>

          {/* Trust */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-2 text-blue-600 mb-3">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-bold">Privacy Guaranteed</span>
            </div>
            <p className="text-xs text-slate-500 leading-normal">
              We never share or sell your phone number. Your data belongs to you.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© 2026 ParkMyCar.online. Created for Google AI Studio.</p>
          <div className="flex gap-6">
            <span>Scan. Notify. Done.</span>
            <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-[8px]">System Status: Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
