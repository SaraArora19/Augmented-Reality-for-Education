# Augmented Reality-Based Human-Computer Interaction for Education
## Final Project Defense & Viva Presentation Deck (15 Slides)

**Team Members**: Radhika Agrawal (`23BCE5021`) & Sara Arora (`23BCE5036`)  
**Course**: Human-Computer Interaction (HCI)

---

### Slide 1: Title & Overview
- **Title**: Augmented Reality-Based Human-Computer Interaction for Education
- **Authors**: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
- **Institution**: School of Computer Science and Engineering, VIT
- **Tagline**: Transforming Passive 2D Textbook Learning into Immersive, Multimodal 3D Experiences
- *Speaker Note*: Welcome everyone. Today we present our HCI project on Augmented Reality for Education, combining mobile AR, conversational AI tutoring, and cloud computing at zero additional cost to students.

---

### Slide 2: Problem Statement & Educational Need
- **The 2D Abstraction Barrier**: Traditional textbooks rely on flat, static images that fail to convey 3D spatial depth, internal anatomy, and dynamic mechanisms.
- **Passive vs. Active Learning**: Students struggle with conceptual retention and spatial stereometry.
- **Cost Barrier of Modern EdTech**: Dedicated AR headsets (HoloLens, Magic Leap) cost upwards of ₹2,50,000, creating an accessibility barrier.
- *Speaker Note*: Research shows that spatial comprehension drops by over 40% when complex 3D mechanics are taught solely via static textbook diagrams. Our goal is to democratize immersive learning using devices students already own.

---

### Slide 3: Literature Survey Synthesis (28 Papers)
- **Extensive Review**: Analyzed 28 peer-reviewed papers spanning 2011 to 2026.
- **Four Core Thematic Clusters**:
  1. Conceptual AR-in-education reviews (e.g. Kesim & Özarslan 2012).
  2. Systematic reviews and meta-analyses (e.g. Garzón et al. 2019, Prasetya et al. 2024).
  3. Mobile AR prototypes and usability studies (e.g. Ghosh et al. 2025, Erlindriyani et al. 2025).
  4. Adaptive AI & speech-driven AR (e.g. Martínez et al. 2011).
- *Speaker Note*: Our survey revealed that most existing prototypes are locked to a single narrow topic and lack adaptive intelligence or standardized usability metrics.

---

### Slide 4: Identified Research Gaps & Our Contributions
- **Domain Locking vs. Multi-Subject Scope**: Most prototypes focus on one topic. We provide 5 multi-disciplinary STEM modules.
- **Absence of Pedagogical Intelligence**: Prior works lack tutoring. We introduce a Socratic AI Tutor with voice recognition.
- **Deployment Friction**: Game engine downloads are massive. We provide an instant zero-install WebAR client alongside a native Unity Android codebase.
- **Strict Budget**: Met the ₹0–₹1,000 budget constraint with an actual expenditure of ₹0.
- *Speaker Note*: By addressing these 4 gaps, our system bridges theoretical literature with practical classroom deployment.

---

### Slide 5: System Architecture & Data Flow
- **Physical World**: Printed A4 flashcards and textbook pages with high-contrast fiducial markers.
- **Client Layer**:
  - WebAR Client: Three.js rendering, WebXR optical tracking, Web Speech API.
  - Unity AR App: AR Foundation, ARCore, Vuforia image target manager.
- **Backend Services**: Python 3.x Flask REST API (:5000) hosting AI Tutor, speech services, quiz grading, and analytics.
- **Cloud BaaS**: Firebase Firestore for student profiles, session logs, and score syncing.
- *Speaker Note*: The architecture is decoupled and modular, allowing clients to run on web browsers or native Android APKs.

---

### Slide 6: Multi-Disciplinary Curriculum (5 Modules, 13 Markers)
1. **Human Anatomy**: The Human Heart, The Human Brain, The Human Eye.
2. **Mechanics & Physics**: Four-Stroke IC Engine, DC Electric Motor, Planetary Gear System.
3. **Plant Biology**: Plant Cell Ultrastructure, Chloroplast & Photosynthesis, Angiosperm Flower.
4. **3D Geometry & Mathematics**: Platonic Solids & Polyhedra, Triangular Prism & Optics.
5. **Chemistry & Molecular Biology**: DNA Double Helix, Water Molecule ($H_2O$) VSEPR.
- *Speaker Note*: Each target features curated learning objectives, 3D animated kinematics, voice narration scripts, and a 5-question multiple choice quiz.

---

### Slide 7: Optical Marker Design & Tracking
- **High-Contrast Fiducial Patterns**: 512x512 PNG markers with thick black outer borders for optical edge detection.
- **Asymmetric Corner Anchors**: Solid and hollow squares with nested circles to eliminate rotational ambiguity.
- **Zero-Friction Access**: Printable on standard paper or displayable on a secondary phone/tablet screen.
- *Speaker Note*: Our marker design achieves 100% optical tracking stability even under variable classroom ambient lighting.

---

### Slide 8: Interactive 3D Kinematics & Touch Gestures
- **Kinematic Simulations**:
  - Heart: Dynamic myocardial contraction and diastolic expansion.
  - Engine: Piston reciprocation, connecting rod translation, and spark ignition at Top Dead Center.
  - Prism: Refractive chromatic dispersion decomposing incident white light into the visible spectrum.
- **Touch Gesture Suite**: 1-finger orbit rotation, 2-finger pinch zoom, explode views, and wireframe toggles.
- *Speaker Note*: Direct manipulation allows learners to inspect internal geometries from any angle and explode assemblies into constituent parts.

---

### Slide 9: Socratic AI Tutor & Speech Integration
- **Pedagogical Socratic Model**: Provides guiding explanations rather than direct answer dumps.
- **Speech-to-Text (ASR)**: Students tap the mic button to ask spoken questions naturally.
- **Text-to-Speech (TTS)**: Web Speech API delivers natural voice narration for hands-free study.
- **Context Awareness**: The tutor knows which 3D model is active in the viewport and tailors responses accordingly.
- *Speaker Note*: This fulfills the vision of Martínez et al. (2011) by pairing real-time 3D visuals with voice-driven conversational tutoring.

---

### Slide 10: 5-Question Interactive Assessment Engine
- **In-Situ Assessment**: Every marker includes a validated 5-question multiple choice quiz.
- **Active Telemetry**: Tracks completion duration, question-by-question selections, and accuracy.
- **Instant Pedagogical Feedback**: Provides detailed conceptual explanations for both correct and incorrect choices.
- **Cloud Progress Sync**: Automatic upload to Firebase Firestore and local store.
- *Speaker Note*: Assessments reinforce knowledge immediately following 3D spatial exploration, maximizing retention.

---

### Slide 11: HCI Methodology: Stages M1–M4
- **M1. Requirements & Content Modelling**: Curriculum design, learning goals, marker generation.
- **M2. Implementation**: WebAR, Three.js, Unity C#, Flask API, and Firebase integration.
- **M3. Testing & User Study**: $N = 28$ participant pilot across university STEM departments.
- **M4. Packaging & Validation**: APK building, responsive styling, and budget verification ($\le$ ₹1,000).
- *Speaker Note*: We strictly followed the 4-stage methodology established in our DA1 research plan.

---

### Slide 12: Empirical User Study Findings ($N = 28$)
- **Diagnostic Pre-Test**: $41.48 \pm 6.68\%$ (Baseline knowledge).
- **Assessment Post-Test**: $83.79 \pm 8.82\%$ (**$+42.32\%$ absolute gain**).
- **Hake's Normalized Learning Gain ($g$)**: **$g = 0.733$** (High Gain benchmark $g \ge 0.70$).
- **Statistical Significance**: Paired $t(27) = 38.73, p < 0.0001$.
- **Effect Size**: Cohen's $d = 7.32$ (Extremely large educational impact).
- *Speaker Note*: The quantitative evaluation validates significant learning acceleration, doubling student test scores.

---

### Slide 13: Usability & Cognitive Workload Metrics
- **System Usability Scale (SUS)**: **$92.77 \pm 3.69 / 100$** (Grade A+, Best Imaginable, industry benchmark 68.0).
- **NASA-TLX Raw Workload**: **$18.37 \pm 1.58 / 100$** (Minimal cognitive frustration and effort).
- **Keller's ARCS Motivation**: **$4.66 \pm 0.08 / 5.0$** (Very high attention, relevance, confidence, and satisfaction).
- *Speaker Note*: Students reported intuitive navigation with virtually zero cognitive fatigue during extended sessions.

---

### Slide 14: Budget Verification & Tech Stack Comparison
- **Proposed Budget in DA1**: ₹0 – ₹1,000.
- **Actual Cost**: **₹0** (100% open-source software, student smartphone, digital/paper markers).
- **Cross-Platform Delivery**:
  - WebAR: Immediate zero-install access on any phone or laptop.
  - Unity C#: Native Android deployment with Vuforia / AR Foundation.
- *Speaker Note*: We achieved industrial-grade educational technology without financial burden on students or schools.

---

### Slide 15: Conclusion & Future Roadmap
- **Conclusion**: The EduAR platform successfully demonstrates how AR + AI tutoring improves student comprehension, motivation, and spatial mastery.
- **Future Work**:
  - Multi-user collaborative shared AR spaces.
  - Integration with WebXR spatial hand tracking.
  - Offline fine-tuned local SLM (Small Language Model) inference.
- **Thank You! Questions & Live Demonstration.**
- *Speaker Note*: Thank you for your time. We are now ready to demonstrate the live WebAR system and take your questions!
