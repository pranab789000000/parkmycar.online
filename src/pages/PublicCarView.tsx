/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "motion/react";
import { Car, Bell, Shield, MapPin, Lightbulb, TriangleAlert, MessageSquare, Info, PhoneCall } from "lucide-react";
import LoadingPage from "../components/LoadingPage";

const AlertButton = ({ icon: Icon, label, labelHi, type, carId, color }: any) => {
  const handleClick = () => {
    // Redirect to our backend proxy which logs and then goes to WhatsApp
    window.location.href = `/api/cars/${carId}/whatsapp?type=${type}&message=${encodeURIComponent(label)}`;
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`w-full p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${color}`}
    >
      <Icon className="w-8 h-8" />
      <div className="text-center">
        <p className="font-bold text-sm leading-tight text-slate-900">{label}</p>
        <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">{labelHi}</p>
      </div>
    </motion.button>
  );
};

export default function PublicCarView() {
  const { carId } = useParams();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customMsg, setCustomMsg] = useState("");

  useEffect(() => {
    const fetchCar = async () => {
      if (!carId) return;
      const snap = await getDoc(doc(db, "cars", carId));
      if (snap.exists()) {
        setCar({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };
    fetchCar();
  }, [carId]);

  if (loading) return <LoadingPage />;

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">404</h1>
          <p className="text-slate-500">Gaadi ki jaankari nahi mili. / Car not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Mobile-first Header */}
      <div className="bg-slate-900 text-white pt-12 pb-24 px-6 rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-md mx-auto text-center relative z-10">
          <Car className="w-12 h-12 mx-auto mb-6 text-blue-400" />
          <h1 className="text-3xl font-display font-bold mb-2">Need to Contact Car Owner?</h1>
          <p className="text-slate-400 text-sm">Scan kiya hai? Ab direct message bhejo.</p>
          
          <div className="mt-8 inline-block px-4 py-2 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
            <span className="text-xs uppercase tracking-widest font-bold opacity-60 block mb-1">Car Number</span>
            <span className="text-2xl font-mono tracking-tighter font-bold">{car.carNumber}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-md mx-auto -mt-12 px-6">
        <div className="bg-white rounded-[32px] p-4 shadow-xl border border-slate-100 flex flex-col gap-4">
           {/* Direct Call Button */}
           <button 
             onClick={() => window.location.href = `/api/cars/${carId}/call`}
             className="w-full p-6 rounded-3xl bg-green-600 text-white flex items-center justify-center gap-4 hover:bg-green-700 transition-all font-bold text-xl"
           >
             <PhoneCall className="w-8 h-8 animate-bounce" />
             Call Owner Now
           </button>

           <div className="grid grid-cols-2 gap-4">
             <AlertButton 
               carId={carId}
               icon={Shield} 
               type="car_blocking"
               label="Car Blocking" 
               labelHi="Gaadi hatao" 
               color="border-red-50 bg-red-50/30 text-red-600"
             />
             <AlertButton 
               carId={carId}
               icon={Lightbulb} 
               type="lights_on"
               label="Lights On" 
               labelHi="Lights band karein" 
               color="border-yellow-50 bg-yellow-50/30 text-yellow-600"
             />
             <AlertButton 
               carId={carId}
               icon={MapPin} 
               type="tyre_flat"
               label="Tyre Flat" 
               labelHi="Tyre check karein" 
               color="border-slate-50 bg-slate-50/30 text-slate-700"
             />
             <AlertButton 
               carId={carId}
               icon={TriangleAlert} 
               type="accident"
               label="Accident" 
               labelHi="Gaadi thuk gayi" 
               color="border-orange-50 bg-orange-50/30 text-orange-600"
             />
           </div>
        </div>

        {/* Custom Message */}
        <div className="mt-6 bg-white rounded-[32px] p-8 shadow-lg border border-slate-100">
           <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
             <MessageSquare className="w-5 h-5 text-blue-600" />
             Custom Message
           </h3>
           <textarea 
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-24 p-4 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
           />
           <button 
            disabled={!customMsg}
            onClick={() => window.location.href = `/api/cars/${carId}/whatsapp?type=custom&message=${encodeURIComponent(customMsg)}`}
            className="w-full mt-4 btn-primary py-4 text-lg"
           >
             Send Message
           </button>
        </div>

        {/* Branding Info */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
            <Info className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Free Service by ParkMyCar.online</span>
          </div>
          <p className="text-[10px] text-slate-300 px-8">Your privacy is important. We never reveal phone numbers to anyone.</p>
        </div>
      </div>
    </div>
  );
}
