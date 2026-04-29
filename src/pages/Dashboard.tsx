/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { Plus, Car as CarIcon, QrCode, Trash2, Bell, ExternalLink, Download, Smartphone, X, Maximize2, ShieldCheck } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

export default function Dashboard() {
  const [cars, setCars] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCar, setNewCar] = useState({ carNumber: "", label: "" });
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [zoomCar, setZoomCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const isUserAdmin = user?.email === "pranab789000000@gmail.com";

  const isProfileComplete = whatsappNumber && phoneNumber && address && displayName;

  useEffect(() => {
    if (!user) return;

    // Fetch user profile
    const fetchProfile = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setWhatsappNumber(data.whatsappNumber || "");
        setPhoneNumber(data.phoneNumber || "");
        setAddress(data.address || "");
        setDisplayName(data.displayName || user.displayName || "");
      } else {
        // Init profile if not exists
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          createdAt: serverTimestamp()
        });
        setDisplayName(user.displayName || "");
      }
    };
    fetchProfile();

    // Fetch Cars (If admin, fetch ALL, otherwise just own)
    const carsQuery = isUserAdmin 
      ? collection(db, "cars")
      : query(collection(db, "cars"), where("ownerId", "==", user.uid));
      
    const unsubscribeCars = onSnapshot(carsQuery, (snapshot) => {
      setCars(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch Alerts (If admin, fetch ALL, otherwise just own)
    const alertsQuery = isUserAdmin
      ? collection(db, "alerts")
      : query(collection(db, "alerts"), where("ownerId", "==", user.uid));

    const unsubscribeAlerts = onSnapshot(alertsQuery, (snapshot) => {
      setAlerts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.timestamp?.seconds - a.timestamp?.seconds));
      setLoading(false);
    });

    return () => {
      unsubscribeCars();
      unsubscribeAlerts();
    };
  }, [user, isUserAdmin]);

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCar.carNumber) return;

    try {
      await addDoc(collection(db, "cars"), {
        ownerId: user.uid,
        carNumber: newCar.carNumber.toUpperCase(),
        label: newCar.label || "My Car",
        createdAt: serverTimestamp(),
      });
      setNewCar({ carNumber: "", label: "" });
      setShowAddCar(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error("Failed to add car", err);
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (confirm("Delete this car? This QR will stop working.")) {
      await deleteDoc(doc(db, "cars", id));
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { 
        whatsappNumber, 
        phoneNumber,
        address,
        displayName
      });
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  const downloadQR = (carId: string, label: string) => {
    const qrCanvas = document.getElementById(`qr-${carId}`) as HTMLCanvasElement;
    if (!qrCanvas) return;

    // Create a high-res sticker canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Border
    ctx.strokeStyle = "#e2e8f0"; // slate-200
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // 3. Draw QR on the Left
    // Scale up the QR code for higher quality
    ctx.drawImage(qrCanvas, 60, 60, 480, 480);

    // 4. Draw Note on the Right
    ctx.fillStyle = "#0f172a"; // slate-900
    ctx.textAlign = "left";
    
    // "SCAN ME"
    ctx.font = "bold 90px sans-serif";
    ctx.fillText("SCAN ME", 600, 250);
    
    // "TO CONTACT"
    ctx.font = "bold 60px sans-serif";
    ctx.fillText("TO CONTACT", 600, 330);

    // Brand Name
    ctx.fillStyle = "#3b82f6"; // blue-600
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("ParkMyCar.online", 600, 500);

    // Status / Privacy Note
    ctx.fillStyle = "#94a3b8"; // slate-400
    ctx.font = "normal 20px sans-serif";
    ctx.fillText("Privacy Protected • Scan. Notify. Done.", 600, 540);

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `ParkMyCar-Sticker-${label.replace(/\s/g, "-")}.png`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile & Settings Space */}
        <div className="col-span-1 space-y-6">
          {isUserAdmin && (
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm">
              <h2 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Admin Mode Active
              </h2>
              <p className="text-xs text-red-600 leading-relaxed">
                You are currently viewing all cars and alerts across the entire system. Actions like "Delete" will remove the vehicle for the owner.
              </p>
            </div>
          )}

          {!isProfileComplete && (
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm">
              <h2 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Profile Incomplete
              </h2>
              <p className="text-xs text-amber-700 leading-relaxed">
                Please complete your profile (Name, Phone, WhatsApp, and Address) to start adding cars and generating QR codes.
              </p>
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="mt-4 w-full py-2 bg-amber-600 text-white rounded-lg text-sm font-bold"
              >
                Complete Profile Now
              </button>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Your Profile Information
            </h2>
            
            {isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">WhatsApp Number</label>
                  <input type="text" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="e.g. 91..." className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Call Phone Number</label>
                  <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Address</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 h-20 resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUpdateProfile} className="btn-primary flex-1">Save Profile</button>
                  <button onClick={() => setIsEditingProfile(false)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Name</span>
                  <span className="font-medium text-slate-700">{displayName || "Not Set"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">WhatsApp</span>
                  <span className="font-mono text-slate-700">{whatsappNumber || "Not Set"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Address</span>
                  <span className="text-slate-700 line-clamp-2">{address || "Not Set"}</span>
                </div>
                <button onClick={() => setIsEditingProfile(true)} className="w-full py-2 border border-blue-100 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50">Edit Profile</button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                Recent Alerts
              </h2>
              {alerts.length > 0 && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold uppercase rounded-full">Live</span>
              )}
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {alerts.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No alerts yet. Your car is safe!</p>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-tight">{alert.type?.replace("_", " ")}</span>
                      <span className="text-[10px] text-slate-400">{alert.timestamp?.toDate().toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-slate-700 italic">"{alert.message || "Someone needs to contact you regarding your car."}"</p>
                    <div className="text-[10px] text-slate-400 font-mono">Car: {alert.carNumber || "Unknown"}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cars List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-slate-900">Your Garage</h1>
            <button 
              onClick={() => setShowAddCar(true)}
              disabled={!isProfileComplete}
              className="btn-primary flex items-center gap-2 disabled:bg-slate-200 disabled:text-slate-400"
              id="add-car-button"
            >
              <Plus className="w-4 h-4" /> Add Car
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cars.map(car => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={car.id} 
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-none mb-1">{car.label}</h3>
                    <div className="font-mono text-sm tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded inline-block">{car.carNumber}</div>
                  </div>
                  <button 
                    onClick={() => handleDeleteCar(car.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-6 items-center">
                  <button 
                    onClick={() => setZoomCar(car)}
                    className="bg-slate-50 p-3 rounded-2xl flex-shrink-0 border border-slate-100 group relative"
                  >
                    <QRCodeCanvas 
                      id={`qr-${car.id}`}
                      value={`${window.location.origin}/c/${car.id}`} 
                      size={100}
                      level="H"
                      includeMargin={false}
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 flex items-center justify-center transition-colors rounded-2xl">
                       <Maximize2 className="w-6 h-6 text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                  <div className="flex flex-col gap-2 w-full">
                    <button 
                      onClick={() => downloadQR(car.id, car.label)}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Download QR
                    </button>
                    <Link 
                      to={`/c/${car.id}`} 
                      className="flex items-center justify-center gap-2 w-full py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> View Page
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}

            {cars.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <CarIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400">Pehli gaadi add karein!</p>
                <p className="text-slate-500 text-sm">Add your first car to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Zoom Modal */}
      <AnimatePresence>
        {zoomCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomCar(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl text-center"
            >
              <button 
                onClick={() => setZoomCar(null)}
                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Scan QR Sticker</h3>
                <p className="text-slate-500 text-sm">Print this and paste it on your {zoomCar.label}</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-6 flex justify-center">
                 <QRCodeCanvas 
                    value={`${window.location.origin}/c/${zoomCar.id}`} 
                    size={280}
                    level="H"
                    includeMargin={false}
                  />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => downloadQR(zoomCar.id, zoomCar.label)}
                  className="btn-primary py-4 text-lg w-full"
                >
                  Download PNG
                </button>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Clear & Zoomed v1.0</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAddCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddCar(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-display font-bold mb-6">Add New Vehicle</h2>
              <form onSubmit={handleAddCar} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Car Number (e.g. DL 01 AB 1234)</label>
                  <input 
                    required
                    type="text" 
                    value={newCar.carNumber}
                    onChange={e => setNewCar({...newCar, carNumber: e.target.value})}
                    placeholder="Enter registration number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Label (e.g. My Fortuner, Dad's Car)</label>
                  <input 
                    type="text" 
                    value={newCar.label}
                    onChange={e => setNewCar({...newCar, label: e.target.value})}
                    placeholder="Enter label"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="submit" className="btn-primary flex-1">Add Vehicle</button>
                  <button type="button" onClick={() => setShowAddCar(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
