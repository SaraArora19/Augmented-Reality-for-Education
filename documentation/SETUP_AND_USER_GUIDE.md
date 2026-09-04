# Augmented Reality HCI Educational System
## Quick Start, Setup & User Guide

**Authors**: Radhika Agrawal (`23BCE5021`) & Sara Arora (`23BCE5036`)  
**Course**: Human-Computer Interaction

---

## 1. System Overview
This project provides two flexible ways to experience the educational augmented reality system:
1. **Live WebAR Client (Instant Execution)**: Runs in any modern browser (Chrome, Safari, Edge, Firefox) on Android phones, tablets, and laptops without installing bulky game engines.
2. **Unity 2022.3 LTS + C# Android Project**: Complete Unity project for native Android ARCore/Vuforia compilation and APK deployment.

---

## 2. Prerequisites
- **Python 3.8+** (Installed: Python 3.14)
- **Web Browser**: Google Chrome or Firefox (with webcam/camera permissions enabled)
- **Optional for Native App**: Unity 2022.3 LTS with Android Build Support

---

## 3. Launching the System in 30 Seconds

### Step 1: Start the Python Backend Server
Open PowerShell in the project directory:
```powershell
cd "e:\augmented reality\python_backend"
python app.py
```
The server will boot and display:
```
=====================================================================
 Augmented Reality HCI Educational Server
 Team: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
 WebAR Client:           http://localhost:5000/
 Printable Flashcards:   http://localhost:5000/flashcards
 HCI Evaluation Portal:  http://localhost:5000/evaluation
 API Base:               http://localhost:5000/api/modules
=====================================================================
 * Running on all addresses (0.0.0.0:5000)
```

---

## 4. Running the WebAR Client on Desktop or Android Phone

### On Your PC / Laptop:
1. Open your browser and navigate to:
   **[http://localhost:5000/](http://localhost:5000/)**
2. Use the top navigation pills to explore any of the 13 interactive 3D models across 5 disciplines.
3. Use mouse controls:
   - **Left Click + Drag**: 3D orbit rotation.
   - **Scroll Wheel**: Smooth zoom.
   - **Right Click + Drag**: Pan camera.
4. Click the left toolbar buttons for **Auto-Rotate**, **Explode Layers**, and **Wireframe Mode**.

### On Your Android Smartphone:
1. Ensure your smartphone is connected to the same Wi-Fi network or mobile hotspot as your PC.
2. Find your PC's local IP address (run `ipconfig` in PowerShell, e.g. `192.168.1.5`).
3. On your phone's Chrome browser, open:
   **`http://<YOUR_PC_IP>:5000/`** (e.g. `http://192.168.1.5:5000/`)
4. Tap **"AR Camera"** at the top right to enable live optical tracking using your phone's rear camera!

---

## 5. Using the Marker Flashcards
1. Open **[http://localhost:5000/flashcards](http://localhost:5000/flashcards)**.
2. You can:
   - **Print** the sheets on physical A4 paper using the "Print Flashcards" button.
   - Or **display** the flashcards on a tablet, laptop, or secondary phone screen!
3. In the WebAR app, point your camera at the high-contrast bordered square to view the 3D model anchored in physical space.

---

## 6. Interactive Learning Features

### Voice Guide (Audio Narration)
- Tap the blue **"Voice Guide"** button in the bottom right corner.
- The system reads out curated pedagogical explanations using the Web Speech API.

### Socratic AI Tutor
- Tap the purple **"AI Tutor"** button.
- A glassmorphic chat drawer opens. You can:
  - Ask questions via text (e.g., *"Why does the left ventricle have thick walls?"*).
  - Click the **Microphone** button to speak your question aloud!
  - Click suggestion chips for instant quiz hints and component breakdowns.

### 5-Question Marker Quiz
- Tap the amber **"Take Quiz (5 Qs)"** button.
- An interactive assessment modal opens with a live timer and question progress bar.
- Answer all 5 questions and click **Submit Quiz**.
- View your percentage score, letter grade (A/B/C), and detailed explanations for every option!

---

## 7. HCI Evaluation Study Portal (M3)
- Navigate to **[http://localhost:5000/evaluation](http://localhost:5000/evaluation)**.
- Administer the validated evaluation battery to student participants:
  1. **Pre-Test diagnostic score**
  2. **Post-Test assessment score**
  3. **10-Item System Usability Scale (SUS)**
  4. **NASA-TLX 6-dimension cognitive workload sliders**
- Click **"Compute Psychometric Indices"** to immediately calculate the SUS grade, normalized learning gain ($g$), and cognitive workload.
- Run `python hci_evaluation/run_evaluation_study.py` to view aggregated statistical tables across all $N=28$ participants.

---

## 8. Unity 2022.3 LTS Project Setup (For Android APK)
1. Open **Unity Hub**.
2. Click **Open** and select the folder:
   `e:\augmented reality\unity_project`
3. Unity will import packages defined in `Packages/manifest.json` (AR Foundation, ARCore, TextMeshPro, Input System).
4. Open the preconfigured scene:
   `Assets/Scenes/MainAREducationScene.unity`
5. Connect your Android smartphone via USB (with USB Debugging enabled).
6. Go to **File -> Build Settings**, switch platform to **Android**, and click **Build and Run**.
