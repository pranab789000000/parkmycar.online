/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Car } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 2
        }}
        className="mb-4"
      >
        <Car className="w-12 h-12 text-slate-900" />
      </motion.div>
      <h2 className="text-xl font-display font-bold text-slate-900">ParkMyCar.online</h2>
      <p className="text-slate-400 text-sm mt-2">Loading your garage...</p>
    </div>
  );
}
