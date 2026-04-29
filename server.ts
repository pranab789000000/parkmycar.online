import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import fs from "fs";
import admin from "firebase-admin";

import { getFirestore } from "firebase-admin/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const firebaseApp = admin.apps.length 
  ? admin.apps[0]! 
  : admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });

const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", name: "ParkMyCar.online API" });
  });

  // Proxy for WhatsApp redirect with logging
  app.get("/api/cars/:carId/whatsapp", async (req, res) => {
    try {
      const { carId } = req.params;
      const { type, message } = req.query;

      // 1. Fetch Car Info
      const carRef = db.collection("cars").doc(carId);
      const carSnap = await carRef.get();

      if (!carSnap.exists) {
        return res.status(404).send("Car not found");
      }

      const carData = carSnap.data()!;
      const ownerId = carData.ownerId;

      // 2. Fetch Owner Phone
      const userRef = db.collection("users").doc(ownerId);
      const userSnap = await userRef.get();
      const whatsappNumber = userSnap.data()?.whatsappNumber;

      if (!whatsappNumber) {
        return res.status(400).send("Owner has not set up WhatsApp notifications.");
      }

      // 3. Log Alert to Firestore
      await db.collection("alerts").add({
        carId,
        ownerId,
        carNumber: carData.carNumber,
        type: type || "custom",
        message: message || `Alert for car ${carData.carNumber}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 4. Redirect to WhatsApp
      const encodedMsg = encodeURIComponent(`ParkMyCar.online Alert 🚗\n\nIssue: ${type?.toString().toUpperCase().replace("_", " ")}\nMessage: ${message || "Please check your vehicle."}\n\nCar: ${carData.carNumber}`);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;
      
      res.redirect(whatsappUrl);
    } catch (error) {
      console.error("WhatsApp Redirect Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Call masking proxy
  app.get("/api/cars/:carId/call", async (req, res) => {
    try {
      const { carId } = req.params;
      console.log(`[DEBUG] Call request for carId: ${carId}`);

      const carRef = db.collection("cars").doc(carId);
      const carSnap = await carRef.get();

      if (!carSnap.exists) {
        console.log(`[DEBUG] Car not found: ${carId}`);
        return res.status(404).send("Car not found");
      }

      const carData = carSnap.data()!;
      const ownerId = carData.ownerId;
      
      const userRef = db.collection("users").doc(ownerId);
      const userSnap = await userRef.get();
      const phone = userSnap.data()?.phoneNumber;

      if (!phone) {
        console.log(`[DEBUG] Owner phone not found for ownerId: ${ownerId}`);
        return res.status(400).send("Owner has not set up a phone number for calls.");
      }

      const cleanPhone = phone.toString().replace(/[^0-9+]/g, "");
      console.log(`[DEBUG] Redirecting to tel:${cleanPhone}`);

      // Log the attempt to Firestore
      await db.collection("alerts").add({
        carId,
        ownerId,
        carNumber: carData.carNumber,
        type: "call_attempt",
        message: "Someone attempted to call you via QR scan.",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // HTML redirect is more reliable for custom protocols in iFrames/Mobile
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Calling Owner...</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8fafc; }
              .card { background: white; padding: 2rem; border-radius: 2rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); text-align: center; max-width: 90%; width: 400px; }
              .icon { font-size: 3rem; margin-bottom: 1rem; display: block; }
              h2 { margin: 0 0 0.5rem 0; color: #1e293b; }
              p { color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; }
              .btn { background: #16a34a; color: white; text-decoration: none; padding: 1rem 2rem; border-radius: 1rem; font-weight: bold; display: inline-block; transition: background 0.2s; }
              .btn:hover { background: #15803d; }
            </style>
          </head>
          <body>
            <div class="card">
              <span class="icon">📞</span>
              <h2>Connecting Call</h2>
              <p>We are opening your phone dialer to contact the owner of car <strong>${carData.carNumber}</strong>.</p>
              <a href="tel:${cleanPhone}" class="btn">Proceed to Call</a>
              <script>
                // Try to trigger automatically
                window.location.href = "tel:${cleanPhone}";
                // Fallback: if they stay on page for 3 seconds, show the button clearly
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Call Proxy Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
