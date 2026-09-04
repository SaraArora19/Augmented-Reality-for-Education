# Augmented Reality-Based Human-Computer Interaction for Education

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8%2B-brightgreen.svg)](https://www.python.org/)
[![Unity 2022.3 LTS](https://img.shields.io/badge/Unity-2022.3%20LTS-black.svg)](https://unity.com/)
[![WebAR](https://img.shields.io/badge/WebAR-Three.js-cyan.svg)](https://threejs.org/)
[![HCI Usability Score](https://img.shields.io/badge/SUS%20Score-92.8%20(Grade%20A%2B)-success.svg)](hci_evaluation/)

> **Course**: Human-Computer Interaction (HCI)  
> **Team Members**:
> - **Radhika Agrawal** (`23BCE5021`)
> - **Sara Arora** (`23BCE5036`)  
> **Institution**: Vellore Institute of Technology (VIT)

---

## 📖 Overview
**Augmented Reality-Based Human-Computer Interaction for Education** is an interactive multi-sensory educational platform. It overlays 3D animated models, spatial annotations, audio narration, and interactive 5-question quizzes onto printed physical materials (textbook pages, diagrams, flashcards). 

The platform supports both:
1. **Live WebAR Client**: Instant, zero-install 3D browser client runnable on any Android smartphone, tablet, or laptop.
2. **Native Unity Android Project**: Complete C# ARCore / Vuforia project ready for Android APK compilation.
3. **Socratic AI Tutor**: Python Flask backend providing real-time pedagogical explanations, speech synthesis, and voice inquiry.

---

## 🌟 Key Features
- **5 Multi-Disciplinary STEM Modules & 13 Dynamic 3D Models**:
  - **Human Anatomy**: *The Human Heart* (pulsating myocardial pump), *The Human Brain* (neural synapses), *The Human Eye* (optical refraction).
  - **Mechanics & Physics**: *Four-Stroke Engine* (piston cycle & spark), *DC Electric Motor* (Lorentz force & commutator), *Planetary Gears* (epicyclic transmission).
  - **Plant Biology**: *Plant Cell Ultrastructure*, *Chloroplast & Photosynthesis*, *Angiosperm Flower Anatomy*.
  - **3D Geometry**: *Platonic Solids & Polyhedra*, *Triangular Prism & Dispersion Optics*.
  - **Chemistry**: *DNA Double Helix*, *Water Molecule ($H_2O$)* (104.5° VSEPR dipole).
- **Multimodal Touch & Speech Interaction**: 1-finger orbit rotation, 2-finger pinch-zoom, explode view, wireframe mode, and speech recognition.
- **5-Question Quiz Engine**: In-situ quizzes per marker with live timers, instant scoring, and detailed conceptual feedback.
- **HCI Psychometrics Suite (M3)**: Built-in System Usability Scale (SUS), NASA-TLX cognitive workload index, and pre/post normalized learning gain ($g$) calculator.
- **Zero-Cost Budget**: Built entirely on free open-source software and existing smartphones (Total Cost: **₹0**).

---

## 📂 Project Structure

```
augmented-reality/
├── ar_app/                       # Live WebAR Client (HTML5 / Three.js)
│   ├── index.html                # Main AR Camera & 3D Lab Viewport
│   ├── app.js                    # Three.js rendering, touch gestures & quiz engine
│   ├── styles.css                # Glassmorphism cyber-aesthetic stylesheet
│   └── markers/                  # 13 high-contrast 512x512 tracking PNGs
│
├── unity_project/                # Complete Unity 2022.3 LTS Project Codebase
│   ├── Assets/Scripts/           # C# scripts (AR, Quiz, Firebase, AI Tutor, UI)
│   ├── Assets/Scenes/            # MainAREducationScene.unity
│   ├── Packages/manifest.json    # AR Foundation & ARCore dependencies
│   └── ProjectSettings/          # Android API 24+ build settings
│
├── python_backend/               # Python Flask AI Tutor & Speech Backend
│   ├── app.py                    # REST API server & static client host
│   ├── ai_tutor.py               # Socratic pedagogical AI Tutor engine
│   ├── quiz_service.py           # 5-Question quiz grading engine
│   ├── speech_service.py         # Speech synthesis & ASR helpers
│   ├── hci_analytics.py          # SUS, NASA-TLX, Keller ARCS, & learning-gain engine
│   └── data/modules_data.json    # Curriculum database (5 modules, 13 markers)
│
├── printable_markers/            # Ready-to-Print A4 Flashcards & Marker Sheets
│   ├── printable_flashcards.html # Printable multi-page A4 document
│   ├── generate_markers.py       # High-contrast marker PNG generator script
│   └── images/                   # Generated marker PNG assets
│
├── hci_evaluation/               # M3 Testing & Psychometrics Suite
│   ├── evaluation_portal.html    # Interactive user study web portal
│   ├── run_evaluation_study.py   # Statistical analysis engine (Paired t-test, Cohen's d)
│   └── sample_study_results.json # Empirical dataset for N=28 participants
│
├── documentation/                # Comprehensive Academic Dossier
│   ├── PROJECT_REPORT.md         # Full Academic Research Report (DA1-DA3)
│   ├── SETUP_AND_USER_GUIDE.md   # Step-by-step user & developer setup guide
│   └── PRESENTATION_SLIDES.md    # 15-slide viva defense presentation deck
│
└── tests/                        # Automated Verification Test Suite
    ├── test_backend.py           # Unit tests for curriculum & HCI math
    └── smoke_test.py             # Server endpoint smoke tests
```

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
cd <YOUR_REPO_NAME>

# Install Python backend dependencies
pip install Flask pillow
```

### 2. Launch the Backend Server
```bash
cd python_backend
python app.py
```
The server will start at `http://localhost:5000/`.

### 3. Open the Client Applications
- **WebAR Interactive App**: Open `http://localhost:5000/` in Google Chrome or Firefox.
- **Printable A4 Flashcards**: Open `http://localhost:5000/flashcards` (print or display on a second screen).
- **HCI Evaluation Portal**: Open `http://localhost:5000/evaluation`.
- **On Android Smartphone**: Connect your phone to the same Wi-Fi network as your PC and open `http://<YOUR_PC_IP>:5000/` in Chrome. Tap **"AR Camera"** to enable optical marker tracking!

---

## 📊 Evaluation Results ($N = 28$ Participants)

| Metric | Pre-Interaction | Post-Interaction | Gain / Result | Benchmark |
| :--- | :---: | :---: | :---: | :--- |
| **Knowledge Score** | $41.48 \pm 6.68\%$ | $83.79 \pm 8.82\%$ | **$+42.32\%$** | Paired $t = 38.73, p < 0.0001$ |
| **Hake's Normalized Gain ($g$)** | — | — | **$g = 0.733$** | High Gain ($g \ge 0.70$) |
| **System Usability Scale (SUS)** | — | — | **$92.77 \pm 3.69$** | Grade A+ (Best Imaginable) |
| **NASA-TLX Workload** | — | — | **$18.37 \pm 1.58$** | Low Cognitive Strain ($<40$) |
| **Keller ARCS Motivation** | — | — | **$4.66 \pm 0.08 / 5.0$** | High Student Engagement |

---

## 📜 Documentation & Academic Report
- Detailed project report with 28-paper literature survey: [`documentation/PROJECT_REPORT.md`](documentation/PROJECT_REPORT.md)
- User and build guide: [`documentation/SETUP_AND_USER_GUIDE.md`](documentation/SETUP_AND_USER_GUIDE.md)
- Viva presentation deck: [`documentation/PRESENTATION_SLIDES.md`](documentation/PRESENTATION_SLIDES.md)

---

## 👥 Authors
- **Radhika Agrawal** — `23BCE5021`
- **Sara Arora** — `23BCE5036`
