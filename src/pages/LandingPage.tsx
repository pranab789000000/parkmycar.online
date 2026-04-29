/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { QrCode, PhoneOff, BellRing, Smartphone, ShieldCheck, Zap } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all"
  >
    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl"></div>

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 fill-current" />
              <span>100% Free & Secure</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-900 mb-6 leading-tight">
              Scan. Notify. <span className="text-blue-600">Done.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Gaadi owner se contact karein bina Number reveal kiye.
              <br className="hidden sm:block" />
              Protect your privacy with QR-based smart alerts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth" className="btn-primary px-8 py-4 text-lg h-14 flex items-center">
                Get Started for Free
              </Link>
              <Link to="/#how-it-works" className="btn-secondary px-8 py-4 text-lg h-14 flex items-center">
                How it works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Image/Illustration Mockup */}
      <section className="px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative bg-slate-900 rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden aspect-video flex items-center justify-center text-white"
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">
                <div className="space-y-6 text-left">
                  <div className="p-4 bg-white/10 backdrop-blur rounded-xl border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-full bg-green-500"></div>
                       <div className="h-4 w-24 bg-white/20 rounded"></div>
                    </div>
                    <p className="text-sm">"Bhai, lights on hain aapki gaadi ki!"</p>
                  </div>
                  <div className="p-4 bg-blue-600 rounded-xl">
                    <p className="text-xs uppercase tracking-wider font-bold mb-1">New Alert</p>
                    <p className="font-medium">Someone reported: Tyre is Flat</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-white rounded-2xl p-4 flex flex-col items-center justify-center">
                     <QrCode className="w-32 h-32 text-slate-900 mb-2" />
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Scan to Contact Owner</p>
                  </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Privacy First, Always.</h2>
            <p className="text-slate-500 mt-4">Smart features for smart car owners.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={PhoneOff} 
              title="No Number Reveal" 
              description="Contact anyone without sharing your phone number publicly. We handle the masking."
            />
            <FeatureCard 
              icon={Smartphone} 
              title="WhatsApp Alerts" 
              description="Get instant notifications on WhatsApp when someone scans your car QR."
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Spam Protection" 
              description="Rate-limiting and device tracking to ensure you only get genuine alerts."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© 2026 ParkMyCar.online - Scan. Notify. Done.</p>
        </div>
      </footer>
    </div>
  );
}
