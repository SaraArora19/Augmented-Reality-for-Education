/**
 * Augmented Reality Educational System — Interactive Client Application
 * Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
 * 
 * Features:
 * 1. Three.js 3D rendering with animated models for 13 educational markers across 5 subjects.
 * 2. Camera WebAR mode with rear-camera video feed integration.
 * 3. Speech Synthesis (TTS) voice guide for hands-free audio narration.
 * 4. Speech Recognition (ASR) voice inquiry for AI Tutor interaction.
 * 5. Conversational Socratic AI Tutor client.
 * 6. 5-Question Interactive Quiz module with scoring and timer.
 */

// Global State
const state = {
  activeMarkerId: 'marker_heart',
  arMode: false,
  autoRotate: true,
  exploded: false,
  wireframe: false,
  modulesData: null,
  activeQuiz: null,
  quizAnswers: {},
  currentQuestionIndex: 0,
  quizStartTime: 0,
  quizTimerInterval: null,
  isNarrating: false,
  isListening: false,
  // MindAR tracking state
  mindARInstance: null,
  mindARRunning: false,
  // AR drag-to-reposition state
  arDragActive: false,
  arDragStartX: 0,
  arDragStartY: 0,
  arModelOffsetX: 0,     // current X screen offset (px)
  arModelOffsetY: 0,     // current Y screen offset (px)
  arModelScale: 1.0,     // current scale multiplier
  arPinchStartDist: 0,
  arPinchStartScale: 1.0,
  arHintTimeout: null
};

// Three.js References
let scene, camera, renderer, controls;
let activeModelGroup = null;
let animationFrameId = null;

// DOM Elements
const canvasContainer = document.getElementById('canvas-container');
const cameraFeed = document.getElementById('camera-feed');
const arViewfinder = document.getElementById('ar-viewfinder');
const trackingStatus = document.getElementById('status-text');
const btnMode3D = document.getElementById('btn-mode-3d');
const btnModeAR = document.getElementById('btn-mode-ar');
const moduleBar = document.getElementById('module-bar');
const mindarContainer = document.getElementById('mindar-container');
const arDragHint = document.getElementById('ar-drag-hint');
const arTargetToast = document.getElementById('ar-target-toast');
const arTargetLabel = document.getElementById('ar-target-label');

// Info Card Elements
const infoCard = document.getElementById('info-card');
const btnCollapseInfo = document.getElementById('btn-collapse-info');
const markerCategory = document.getElementById('marker-category');
const markerTitle = document.getElementById('marker-title');
const markerObjectives = document.getElementById('marker-objectives');
const markerFact = document.getElementById('marker-fact');
const markerComponents = document.getElementById('marker-components');

// Action Buttons
const btnVoiceNarration = document.getElementById('btn-voice-narration');
const audioIcon = document.getElementById('audio-icon');
const btnOpenTutor = document.getElementById('btn-open-tutor');
const btnOpenQuiz = document.getElementById('btn-open-quiz');

// AI Tutor Drawer
const tutorDrawer = document.getElementById('tutor-drawer');
const btnCloseTutor = document.getElementById('btn-close-tutor');
const tutorContextMarker = document.getElementById('tutor-context-marker');
const tutorMessages = document.getElementById('tutor-messages');
const tutorSuggestions = document.getElementById('tutor-suggestions');
const tutorInputField = document.getElementById('tutor-input-field');
const btnSendTutor = document.getElementById('btn-send-tutor');
const btnMicInput = document.getElementById('btn-mic-input');

// Quiz Modal Elements
const quizModal = document.getElementById('quiz-modal');
const btnCloseQuiz = document.getElementById('btn-close-quiz');
const quizMarkerTitle = document.getElementById('quiz-marker-title');
const quizContainer = document.getElementById('quiz-container');
const quizResultsPanel = document.getElementById('quiz-results-panel');
const quizProgressFill = document.getElementById('quiz-progress-fill');
const quizQNum = document.getElementById('quiz-q-num');
const quizTimer = document.getElementById('quiz-timer');
const quizQuestionText = document.getElementById('quiz-question-text');
const quizOptionsContainer = document.getElementById('quiz-options-container');
const btnQuizPrev = document.getElementById('btn-quiz-prev');
const btnQuizNext = document.getElementById('btn-quiz-next');
const btnQuizSubmit = document.getElementById('btn-quiz-submit');
const btnQuizRetry = document.getElementById('btn-quiz-retry');

// Palette Buttons
const btnRotateAuto = document.getElementById('btn-rotate-auto');
const btnExplodeView = document.getElementById('btn-explode-view');
const btnWireframe = document.getElementById('btn-wireframe');
const btnResetCam = document.getElementById('btn-reset-cam');

/* ==========================================================================
   1. Initialization & Curriculum Data Loading
   ========================================================================== */
async function initApp() {
  initThreeScene();
  setupEventListeners();

  try {
    const res = await fetch('/api/modules');
    if (res.ok) {
      state.modulesData = await res.json();
    }
  } catch (err) {
    console.warn('Backend API offline or standalone; using fallback curriculum.');
  }

  loadMarker(state.activeMarkerId);
}

/* ==========================================================================
   2. Three.js Scene Setup & Render Loop
   ========================================================================== */
function initThreeScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 7);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasContainer.appendChild(renderer.domElement);

  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 20;
  controls.minDistance = 2;

  // Illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
  keyLight.position.set(5, 10, 7);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);

  // Subtle grid plane (hidden in AR camera mode)
  const gridHelper = new THREE.GridHelper(10, 20, 0x06b6d4, 0x1e293b);
  gridHelper.position.y = -1.8;
  gridHelper.name = "gridHelper";
  scene.add(gridHelper);

  window.addEventListener('resize', onWindowResize);
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  if (activeModelGroup) {
    if (state.autoRotate) {
      activeModelGroup.rotation.y += 0.005;
    }

    // Dynamic model-specific animations
    if (activeModelGroup.userData.animate) {
      activeModelGroup.userData.animate(time);
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

/* ==========================================================================
   3. Procedural 3D Educational Models
   ========================================================================== */
function loadMarker(markerId) {
  state.activeMarkerId = markerId;

  // Clear previous model
  if (activeModelGroup) {
    scene.remove(activeModelGroup);
    activeModelGroup = null;
  }

  // Create new model group
  const group = new THREE.Group();
  group.name = markerId;

  switch (markerId) {
    case 'marker_heart':
      createHeartModel(group);
      break;
    case 'marker_brain':
      createBrainModel(group);
      break;
    case 'marker_eye':
      createEyeModel(group);
      break;
    case 'marker_engine':
      createEngineModel(group);
      break;
    case 'marker_motor':
      createMotorModel(group);
      break;
    case 'marker_gears':
      createGearsModel(group);
      break;
    case 'marker_plantcell':
      createPlantCellModel(group);
      break;
    case 'marker_photosynthesis':
      createChloroplastModel(group);
      break;
    case 'marker_flower':
      createFlowerModel(group);
      break;
    case 'marker_polyhedra':
      createPolyhedraModel(group);
      break;
    case 'marker_prism':
      createPrismModel(group);
      break;
    case 'marker_dna':
      createDNAModel(group);
      break;
    case 'marker_water':
      createWaterModel(group);
      break;
    default:
      createHeartModel(group);
  }

  activeModelGroup = group;
  scene.add(activeModelGroup);

  // Update UI Metadata
  updateInfoCard(markerId);
  updateModuleChips(markerId);

  // Stop voice narration if active
  if (state.isNarrating) {
    stopNarration();
  }
}

// 3D MODEL 1: The Human Heart
function createHeartModel(group) {
  const muscleMat = new THREE.MeshPhongMaterial({ color: 0xb91c1c, shininess: 30 });
  const arteryMat = new THREE.MeshPhongMaterial({ color: 0xef4444, shininess: 40 });
  const veinMat = new THREE.MeshPhongMaterial({ color: 0x2563eb, shininess: 40 });

  // Main Ventricles Body (Compound ellipsoids)
  const leftVentGeo = new THREE.SphereGeometry(1.1, 32, 32);
  leftVentGeo.scale(0.8, 1.2, 0.9);
  const leftVent = new THREE.Mesh(leftVentGeo, muscleMat);
  leftVent.position.set(-0.3, -0.2, 0);
  group.add(leftVent);

  const rightVentGeo = new THREE.SphereGeometry(0.9, 32, 32);
  rightVentGeo.scale(0.7, 1.1, 0.8);
  const rightVent = new THREE.Mesh(rightVentGeo, muscleMat);
  rightVent.position.set(0.4, -0.3, 0.2);
  group.add(rightVent);

  // Atria
  const atriaGeo = new THREE.SphereGeometry(0.7, 24, 24);
  const leftAtrium = new THREE.Mesh(atriaGeo, veinMat);
  leftAtrium.position.set(-0.5, 0.8, -0.2);
  group.add(leftAtrium);

  const rightAtrium = new THREE.Mesh(atriaGeo, veinMat);
  rightAtrium.position.set(0.6, 0.7, 0);
  group.add(rightAtrium);

  // Aorta Arch (Torus curve)
  const aortaGeo = new THREE.TorusGeometry(0.6, 0.2, 16, 32, Math.PI);
  const aorta = new THREE.Mesh(aortaGeo, arteryMat);
  aorta.rotation.z = Math.PI / 1.2;
  aorta.position.set(-0.1, 1.3, -0.1);
  group.add(aorta);

  // Superior Vena Cava (Cylinder)
  const venaCavaGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.9, 16);
  const venaCava = new THREE.Mesh(venaCavaGeo, veinMat);
  venaCava.position.set(0.7, 1.2, -0.1);
  group.add(venaCava);

  // Heartbeat Pulsation Animation
  group.userData.animate = (time) => {
    const pulse = 1.0 + Math.sin(time * 6.5) * 0.05 + Math.sin(time * 13) * 0.02;
    group.scale.set(pulse, pulse, pulse);
  };
}

// 3D MODEL 2: The Human Brain
function createBrainModel(group) {
  const cerebrumMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    roughness: 0.5,
    metalness: 0.1
  });
  const cerebMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, roughness: 0.7 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.6 });

  // Left & Right Cerebral Hemispheres
  const hemiGeo = new THREE.SphereGeometry(1.2, 32, 32);
  hemiGeo.scale(0.85, 1.0, 1.3);

  const leftHemi = new THREE.Mesh(hemiGeo, cerebrumMat);
  leftHemi.position.set(-0.6, 0.3, 0);
  group.add(leftHemi);

  const rightHemi = new THREE.Mesh(hemiGeo, cerebrumMat);
  rightHemi.position.set(0.6, 0.3, 0);
  group.add(rightHemi);

  // Cerebellum (posterior lower)
  const cerebGeo = new THREE.SphereGeometry(0.7, 24, 24);
  cerebGeo.scale(1.2, 0.7, 0.9);
  const cerebellum = new THREE.Mesh(cerebGeo, cerebMat);
  cerebellum.position.set(0, -0.7, -0.9);
  group.add(cerebellum);

  // Brainstem
  const stemGeo = new THREE.CylinderGeometry(0.25, 0.2, 1.4, 20);
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(0, -1.1, -0.2);
  stem.rotation.x = 0.2;
  group.add(stem);

  // Synaptic Glowing Pulse
  group.userData.animate = (time) => {
    cerebrumMat.emissive = new THREE.Color(0xec4899);
    cerebrumMat.emissiveIntensity = 0.15 + 0.1 * Math.sin(time * 3);
  };
}

// 3D MODEL 3: The Human Eye
function createEyeModel(group) {
  const scleraMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const corneaMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    roughness: 0.1,
    transmission: 0.9
  });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const nerveMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });

  // Eyeball Sclera
  const eyeball = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 32), scleraMat);
  group.add(eyeball);

  // Cornea Lens bulge
  const cornea = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.5), corneaMat);
  cornea.position.set(0, 0, 1.0);
  group.add(cornea);

  // Iris Disc
  const iris = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.65, 32), irisMat);
  iris.position.set(0, 0, 1.35);
  group.add(iris);

  // Pupil
  const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.25, 32), pupilMat);
  pupil.position.set(0, 0, 1.36);
  group.add(pupil);

  // Optic Nerve at back
  const nerve = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 16), nerveMat);
  nerve.rotation.x = Math.PI / 2;
  nerve.position.set(0, 0, -1.8);
  group.add(nerve);
}

// 3D MODEL 4: Four-Stroke IC Engine
function createEngineModel(group) {
  const blockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, wireframe: true });
  const pistonMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.3 });
  const rodMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
  const crankMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7 });
  const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

  // Cylinder Casing
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 3.2, 24, 1, true), blockMat);
  cylinder.position.y = 0.5;
  group.add(cylinder);

  // Piston Head
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.8, 24), pistonMat);
  group.add(piston);

  // Connecting Rod
  const rod = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.6, 0.18), rodMat);
  group.add(rod);

  // Crankshaft
  const crank = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16), crankMat);
  crank.position.set(0, -1.6, 0);
  crank.rotation.z = Math.PI / 2;
  group.add(crank);

  // Spark Indicator
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), sparkMat);
  spark.position.set(0, 1.8, 0);
  group.add(spark);

  // Kinematic Cycle Animation
  group.userData.animate = (time) => {
    const crankAngle = time * 5.0;
    const pistonStroke = Math.sin(crankAngle) * 0.8;
    piston.position.y = 0.5 + pistonStroke;
    rod.position.y = -0.3 + pistonStroke * 0.5;
    rod.rotation.z = Math.cos(crankAngle) * 0.2;
    crank.rotation.x = crankAngle;

    // Spark flashes at TDC
    spark.visible = pistonStroke > 0.7;
  };
}

// 3D MODEL 5: DC Electric Motor
function createMotorModel(group) {
  const nMagnetMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // North pole (Red)
  const sMagnetMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // South pole (Blue)
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.7, roughness: 0.2 });
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });

  // Stator Magnets
  const nPole = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 2.0), nMagnetMat);
  nPole.position.set(-1.6, 0, 0);
  group.add(nPole);

  const sPole = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 2.0), sMagnetMat);
  sPole.position.set(1.6, 0, 0);
  group.add(sPole);

  // Central Shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 16), shaftMat);
  shaft.rotation.x = Math.PI / 2;
  group.add(shaft);

  // Armature Coil Assembly
  const rotorGroup = new THREE.Group();
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.1, 16, 32), copperMat);
  rotorGroup.add(coil);

  // Split-Ring Commutator
  const commGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16, 1, true, 0, Math.PI * 1.8);
  const commutator = new THREE.Mesh(commGeo, copperMat);
  commutator.position.z = 1.0;
  commutator.rotation.x = Math.PI / 2;
  rotorGroup.add(commutator);

  group.add(rotorGroup);

  group.userData.animate = (time) => {
    rotorGroup.rotation.z = time * 6.0;
  };
}

// 3D MODEL 6: Planetary Gear System
function createGearsModel(group) {
  const sunMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5 });
  const planetMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.5 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, wireframe: true });

  // Central Sun Gear
  const sun = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.3, 20), sunMat);
  sun.rotation.x = Math.PI / 2;
  group.add(sun);

  // Outer Ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.15, 16, 36), ringMat);
  group.add(ring);

  // 3 Planet Gears orbiting Sun
  const planets = [];
  const planetCount = 3;
  for (let i = 0; i < planetCount; i++) {
    const angle = (i / planetCount) * Math.PI * 2;
    const planet = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 16), planetMat);
    planet.rotation.x = Math.PI / 2;
    group.add(planet);
    planets.push({ mesh: planet, baseAngle: angle });
  }

  group.userData.animate = (time) => {
    sun.rotation.z = time * 3.0;
    const orbitSpeed = time * 0.8;
    const orbitRadius = 1.15;

    planets.forEach((p) => {
      const a = p.baseAngle + orbitSpeed;
      p.mesh.position.set(Math.cos(a) * orbitRadius, Math.sin(a) * orbitRadius, 0);
      p.mesh.rotation.z = -time * 2.5;
    });
  };
}

// 3D MODEL 7: Plant Cell Ultrastructure
function createPlantCellModel(group) {
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x15803d, wireframe: false, transparent: true, opacity: 0.65 });
  const vacuoleMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.8, roughness: 0.2 });
  const chloroplastMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
  const nucleusMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6 });

  // Hexagonal Cell Wall
  const wallGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.2, 6);
  const wall = new THREE.Mesh(wallGeo, wallMat);
  group.add(wall);

  // Central Vacuole (Large fluid sack)
  const vacuoleGeo = new THREE.SphereGeometry(0.85, 24, 24);
  vacuoleGeo.scale(1.1, 1.4, 0.9);
  const vacuole = new THREE.Mesh(vacuoleGeo, vacuoleMat);
  vacuole.position.set(-0.2, 0, 0);
  group.add(vacuole);

  // Nucleus
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), nucleusMat);
  nucleus.position.set(0.8, 0.5, 0.3);
  group.add(nucleus);

  // Chloroplasts (Green disc-like granules)
  for (let i = 0; i < 6; i++) {
    const cp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), chloroplastMat);
    cp.scale.set(1.5, 0.7, 0.7);
    const theta = (i / 6) * Math.PI * 2;
    cp.position.set(Math.cos(theta) * 1.1, (i % 2 === 0 ? 0.6 : -0.6), Math.sin(theta) * 1.1);
    group.add(cp);
  }
}

// 3D MODEL 8: Chloroplast & Photosynthesis
function createChloroplastModel(group) {
  const envelopeMat = new THREE.MeshPhysicalMaterial({ color: 0x10b981, transparent: true, opacity: 0.5, roughness: 0.3 });
  const granumMat = new THREE.MeshStandardMaterial({ color: 0x065f46 });

  // Outer Envelope
  const envGeo = new THREE.SphereGeometry(1.5, 32, 24);
  envGeo.scale(1.4, 0.8, 0.9);
  const envelope = new THREE.Mesh(envGeo, envelopeMat);
  group.add(envelope);

  // Thylakoid Grana Stacks
  for (let s = -2; s <= 2; s++) {
    for (let d = 0; d < 4; d++) {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 16), granumMat);
      disc.position.set(s * 0.55, -0.3 + d * 0.12, (s % 2) * 0.2);
      group.add(disc);
    }
  }
}

// 3D MODEL 9: Flower Anatomy
function createFlowerModel(group) {
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xec4899, side: THREE.DoubleSide });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });

  // Stem
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.0, 16), stemMat);
  stem.position.y = -1.0;
  group.add(stem);

  // Ovary / Receptacle
  const ovary = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 20), centerMat);
  group.add(ovary);

  // 6 Petals
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const petalGeo = new THREE.SphereGeometry(0.6, 16, 16);
    petalGeo.scale(0.5, 1.2, 0.1);
    const petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0.1);
    petal.rotation.z = angle - Math.PI / 2;
    group.add(petal);
  }
}

// 3D MODEL 10: Platonic Solids (Polyhedra)
function createPolyhedraModel(group) {
  const icosaMat = new THREE.MeshStandardMaterial({
    color: 0x6366f1,
    wireframe: false,
    roughness: 0.2,
    metalness: 0.4
  });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });

  // Outer Icosahedron
  const icosa = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 0), icosaMat);
  group.add(icosa);

  const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.41, 0), wireMat);
  group.add(wire);

  // Inner Dual Dodecahedron
  const innerDualMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 });
  const innerDual = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), innerDualMat);
  group.add(innerDual);

  group.userData.animate = (time) => {
    innerDual.rotation.x = time * 0.8;
    innerDual.rotation.y = time * 1.2;
  };
}

// 3D MODEL 11: Triangular Prism & Refraction Optics
function createPrismModel(group) {
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    roughness: 0.05,
    transmission: 0.95
  });

  // Triangular Prism
  const prismGeo = new THREE.CylinderGeometry(1.4, 1.4, 1.6, 3);
  const prism = new THREE.Mesh(prismGeo, glassMat);
  group.add(prism);

  // Incident White Light Ray
  const rayGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8);
  const rayMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const ray = new THREE.Mesh(rayGeo, rayMat);
  ray.position.set(-2.0, 0, 0);
  ray.rotation.z = Math.PI / 3;
  group.add(ray);

  // Refracted Rainbow Fan
  const colors = [0xef4444, 0xf59e0b, 0x10b981, 0x06b6d4, 0x8b5cf6];
  colors.forEach((c, idx) => {
    const rainbowRay = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8),
      new THREE.MeshBasicMaterial({ color: c })
    );
    rainbowRay.position.set(1.6, 0, 0);
    rainbowRay.rotation.z = -Math.PI / 3 + (idx - 2) * 0.08;
    group.add(rainbowRay);
  });
}

// 3D MODEL 12: DNA Double Helix
function createDNAModel(group) {
  const strandMat1 = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3 });
  const strandMat2 = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
  const atPairMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
  const gcPairMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });

  const totalSteps = 24;
  const height = 3.6;
  const radius = 0.9;

  for (let i = 0; i < totalSteps; i++) {
    const progress = i / totalSteps;
    const y = (progress - 0.5) * height;
    const angle = progress * Math.PI * 4;

    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const x2 = -x1;
    const z2 = -z1;

    // Outer Phosphate Beads
    const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), strandMat1);
    sphere1.position.set(x1, y, z1);
    group.add(sphere1);

    const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), strandMat2);
    sphere2.position.set(x2, y, z2);
    group.add(sphere2);

    // Hydrogen-Bonded Base Pair Rung
    const rungGeo = new THREE.CylinderGeometry(0.04, 0.04, radius * 2, 8);
    const rungMat = (i % 2 === 0) ? atPairMat : gcPairMat;
    const rung = new THREE.Mesh(rungGeo, rungMat);
    rung.position.set(0, y, 0);
    rung.rotation.z = Math.PI / 2;
    rung.rotation.y = -angle;
    group.add(rung);
  }

  group.userData.animate = (time) => {
    group.rotation.y = time * 0.6;
  };
}

// 3D MODEL 13: Water Molecule (H2O)
function createWaterModel(group) {
  const oxygenMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.2 });
  const hydrogenMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const bondMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 });

  // Central Oxygen
  const oxygen = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32), oxygenMat);
  group.add(oxygen);

  // Water Bond Angle: 104.5 degrees (half angle = 52.25 degrees)
  const halfAngleRad = (104.5 / 2) * (Math.PI / 180);
  const bondLength = 1.6;

  const h1Pos = new THREE.Vector3(Math.sin(halfAngleRad) * bondLength, -Math.cos(halfAngleRad) * bondLength, 0);
  const h2Pos = new THREE.Vector3(-Math.sin(halfAngleRad) * bondLength, -Math.cos(halfAngleRad) * bondLength, 0);

  // Hydrogens
  const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 24), hydrogenMat);
  h1.position.copy(h1Pos);
  group.add(h1);

  const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 24), hydrogenMat);
  h2.position.copy(h2Pos);
  group.add(h2);

  // Covalent Bond Cylinders
  const createBond = (targetPos) => {
    const dist = targetPos.length();
    const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, dist, 16), bondMat);
    bond.position.copy(targetPos).multiplyScalar(0.5);
    bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), targetPos.clone().normalize());
    return bond;
  };

  group.add(createBond(h1Pos));
  group.add(createBond(h2Pos));
}

/* ==========================================================================
   4. UI State & Metadata Rendering
   ========================================================================== */
function updateInfoCard(markerId) {
  if (!state.modulesData) return;

  let foundMarker = null;
  for (const mod of state.modulesData.modules) {
    const m = mod.markers.find(item => item.id === markerId);
    if (m) {
      foundMarker = m;
      break;
    }
  }

  if (!foundMarker) return;

  markerCategory.textContent = foundMarker.category || "Educational Topic";
  markerTitle.textContent = foundMarker.name;
  tutorContextMarker.textContent = foundMarker.name;

  // Objectives
  markerObjectives.innerHTML = "";
  foundMarker.learning_objectives.forEach(obj => {
    const li = document.createElement("li");
    li.textContent = obj;
    markerObjectives.appendChild(li);
  });

  // Fact
  markerFact.textContent = foundMarker.key_facts[0] || "";

  // Components
  markerComponents.innerHTML = "";
  foundMarker.components.forEach(comp => {
    const chip = document.createElement("span");
    chip.className = "comp-chip";
    chip.textContent = comp.name;
    chip.title = comp.function;
    chip.addEventListener("click", () => {
      openTutorWithPrompt(`Explain what ${comp.name} does in ${foundMarker.name}`);
    });
    markerComponents.appendChild(chip);
  });
}

function updateModuleChips(markerId) {
  document.querySelectorAll(".module-chip").forEach(chip => {
    if (chip.getAttribute("data-marker") === markerId) {
      chip.classList.add("active");
      chip.scrollIntoView({ behavior: "smooth", inline: "center" });
    } else {
      chip.classList.remove("active");
    }
  });
}

/* ==========================================================================
   5. Camera AR Mode — MindAR Real Image Tracking + Touch Drag/Scale
   ========================================================================== */

/**
 * The 13 marker IDs in the exact order they are passed to MindAR's imageTargetSrc.
 * MindAR assigns anchor index 0 = first image, 1 = second, etc.
 * We compile from the PNG files in /markers/
 */
const MARKER_ORDER = [
  'marker_heart', 'marker_brain', 'marker_eye',
  'marker_engine', 'marker_motor', 'marker_gears',
  'marker_plantcell', 'marker_photosynthesis', 'marker_flower',
  'marker_polyhedra', 'marker_prism', 'marker_dna', 'marker_water'
];

// Maps anchor index → marker id
const ANCHOR_TO_MARKER = {};
MARKER_ORDER.forEach((id, idx) => { ANCHOR_TO_MARKER[idx] = id; });

/** Show the "detected" toast briefly */
function showTargetToast(markerName) {
  arTargetLabel.textContent = `✓ Detected: ${markerName}`;
  arTargetToast.classList.remove('hidden');
  clearTimeout(arTargetToast._hideTimer);
  arTargetToast._hideTimer = setTimeout(() => arTargetToast.classList.add('hidden'), 3000);
}

/** Converts the active model's screen position using the AR offset deltas */
function applyARModelOffset() {
  if (!state.mindARRunning || !activeModelGroup) return;
  // Offset is stored; we apply it via the Three.js object's world position on the MindAR anchor
  // The anchor group already positions from the marker; we add offset as a child translation
  const parent = activeModelGroup.parent;
  if (parent) {
    parent.position.x = (state.arModelOffsetX / window.innerWidth)  *  3.0;
    parent.position.y = -(state.arModelOffsetY / window.innerHeight) *  3.0;
    parent.scale.setScalar(state.arModelScale);
  }
}

/**
 * Start MindAR with real image tracking.
 * MindAR compiles the marker PNGs client-side on first run (takes ~5–15 s).
 */
async function startMindAR() {
  if (state.mindARRunning) return;

  trackingStatus.textContent = 'Compiling AR targets…';

  // Build the list of marker PNG URLs in MARKER_ORDER sequence
  const imageUrls = MARKER_ORDER.map(id => `/markers/${id}.png`);

  try {
    // MindARThree is exposed globally by the CDN bundle
    const MindARThree = (window.MINDAR && window.MINDAR.IMAGE && window.MINDAR.IMAGE.MindARThree)
      || (window.MINDAR && window.MINDAR.MindARThree)
      || window.MindARThree
      || null;

    if (!MindARThree) {
      throw new Error('MindAR library not loaded');
    }

    // Reset offsets
    state.arModelOffsetX = 0;
    state.arModelOffsetY = 0;
    state.arModelScale = 1.0;

    const mindarThree = new MindARThree({
      container: mindarContainer,
      imageTargetSrc: imageUrls,     // compile from PNGs at runtime
      maxTrack: 1,
      uiLoading: 'no',
      uiScanning: 'no',
      uiError: 'no',
    });

    state.mindARInstance = mindarThree;

    const { renderer: mrRenderer, scene: mrScene, camera: mrCamera } = mindarThree;

    // Add ambient + key light to MindAR scene
    mrScene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const kl = new THREE.DirectionalLight(0xffffff, 0.8);
    kl.position.set(5, 10, 7);
    mrScene.add(kl);
    mrScene.add(new THREE.DirectionalLight(0x38bdf8, 0.4).position.set(-5, 5, -5) && kl);

    // Create one anchor per marker
    const anchorGroups = [];
    MARKER_ORDER.forEach((markerId, idx) => {
      const anchor = mindarThree.addAnchor(idx);
      const modelGroup = new THREE.Group();
      anchor.group.add(modelGroup);
      anchorGroups.push({ anchor, modelGroup, markerId });

      // Build the 3D model inside this anchor
      buildModelIntoGroup(markerId, modelGroup);

      // Scale to fit marker (MindAR world units ≈ marker physical width)
      modelGroup.scale.setScalar(0.07);

      anchor.onTargetFound = () => {
        state.activeMarkerId = markerId;
        showTargetToast(markerId.replace('marker_', '').replace(/_/g, ' '));
        updateInfoCard(markerId);
        updateModuleChips(markerId);
        trackingStatus.textContent = `Tracking: ${markerId.replace('marker_', '').replace(/_/g, ' ')}`;
      };
      anchor.onTargetLost = () => {
        trackingStatus.textContent = 'AR Camera: Scanning…';
        arTargetToast.classList.add('hidden');
      };
    });

    // Start the MindAR session (opens camera + starts tracking)
    await mindarThree.start();
    state.mindARRunning = true;

    // Render loop
    mrRenderer.setAnimationLoop((time) => {
      const t = time * 0.001;
      // Animate active model group
      anchorGroups.forEach(({ anchor, modelGroup }) => {
        if (anchor.group.visible && modelGroup.userData.animate) {
          modelGroup.userData.animate(t);
        }
        if (state.autoRotate && anchor.group.visible) {
          modelGroup.rotation.y += 0.005;
        }
      });
      mrRenderer.render(mrScene, mrCamera);
    });

    trackingStatus.textContent = 'AR Camera: Scanning…';

    // Show drag hint for 6 s then auto-hide
    arDragHint.classList.remove('hidden');
    clearTimeout(state.arHintTimeout);
    state.arHintTimeout = setTimeout(() => arDragHint.classList.add('hidden'), 6000);

    setupARDragGestures(mindarContainer);

  } catch (err) {
    console.warn('[MindAR] Could not start tracking:', err);
    trackingStatus.textContent = 'AR: fallback camera mode';
    // Fallback: attempt raw camera feed or virtual AR mode
    startFallbackCamera();
  }
}

/** Fallback: show raw camera feed or prompt mobile options */
async function startFallbackCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('[Camera] getUserMedia not available (Insecure HTTP context on mobile)');
    openCameraModal();
    startVirtualARMode();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    cameraFeed.srcObject = stream;
    cameraFeed.classList.add('active');
    document.body.classList.add('mindar-active'); // hides Three.js canvas, shows camera bg
    trackingStatus.textContent = 'Camera Active (Live Feed)';
    arDragHint.classList.remove('hidden');
    clearTimeout(state.arHintTimeout);
    state.arHintTimeout = setTimeout(() => arDragHint.classList.add('hidden'), 6000);
    setupARDragGestures(cameraFeed);
  } catch (err) {
    console.warn('[Camera] getUserMedia failed:', err);
    openCameraModal();
    startVirtualARMode();
  }
}

/** Virtual AR Mode for mobile browsers where camera is restricted over HTTP */
function startVirtualARMode() {
  document.body.classList.add('mindar-active');
  trackingStatus.textContent = 'AR Mode Active (Virtual Camera)';
  arDragHint.classList.remove('hidden');
  clearTimeout(state.arHintTimeout);
  state.arHintTimeout = setTimeout(() => arDragHint.classList.add('hidden'), 6000);
  setupARDragGestures(canvasContainer);
}

/** Camera modal UI helpers */
function openCameraModal() {
  const modal = document.getElementById('camera-modal');
  if (modal) modal.style.display = 'flex';
}

function closeCameraModal() {
  const modal = document.getElementById('camera-modal');
  if (modal) modal.style.display = 'none';
}

// Camera modal event listeners
document.addEventListener('DOMContentLoaded', () => {
  const btnCloseModal = document.getElementById('btn-close-camera-modal');
  const btnDismissModal = document.getElementById('btn-dismiss-camera-modal');
  const btnEnableVirtual = document.getElementById('btn-enable-virtual-ar');

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeCameraModal);
  if (btnDismissModal) btnDismissModal.addEventListener('click', closeCameraModal);
  if (btnEnableVirtual) {
    btnEnableVirtual.addEventListener('click', () => {
      closeCameraModal();
      startVirtualARMode();
    });
  }
});

/** Stop MindAR and restore 3D Lab mode */
async function stopMindAR() {
  if (state.mindARInstance) {
    try { await state.mindARInstance.stop(); } catch (_) {}
    state.mindARInstance = null;
  }
  state.mindARRunning = false;
  mindarContainer.classList.remove('active');
  document.body.classList.remove('mindar-active');
  arDragHint.classList.add('hidden');
  arTargetToast.classList.add('hidden');
  removeARDragGestures();

  // Also stop fallback camera if running
  if (cameraFeed.srcObject) {
    cameraFeed.srcObject.getTracks().forEach(t => t.stop());
    cameraFeed.srcObject = null;
    cameraFeed.classList.remove('active');
  }
}

/**
 * Builds the same procedural 3D model that loadMarker() builds,
 * but populates an *externally-provided* group (for MindAR anchors).
 */
function buildModelIntoGroup(markerId, group) {
  switch (markerId) {
    case 'marker_heart':         createHeartModel(group); break;
    case 'marker_brain':         createBrainModel(group); break;
    case 'marker_eye':           createEyeModel(group); break;
    case 'marker_engine':        createEngineModel(group); break;
    case 'marker_motor':         createMotorModel(group); break;
    case 'marker_gears':         createGearsModel(group); break;
    case 'marker_plantcell':     createPlantCellModel(group); break;
    case 'marker_photosynthesis':createChloroplastModel(group); break;
    case 'marker_flower':        createFlowerModel(group); break;
    case 'marker_polyhedra':     createPolyhedraModel(group); break;
    case 'marker_prism':         createPrismModel(group); break;
    case 'marker_dna':           createDNAModel(group); break;
    case 'marker_water':         createWaterModel(group); break;
    default:                     createHeartModel(group);
  }
}

/* ---------- Touch Drag + Pinch Zoom on the AR overlay ---------- */
let _arDragTarget = null;

function onARPointerDown(e) {
  if (e.touches && e.touches.length === 2) {
    // Two-finger pinch — record starting distance
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    state.arPinchStartDist  = Math.hypot(dx, dy);
    state.arPinchStartScale = state.arModelScale;
    state.arDragActive = false;
    return;
  }

  // Single finger — start drag
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  const cy = e.touches ? e.touches[0].clientY : e.clientY;
  state.arDragActive = true;
  state.arDragStartX  = cx - state.arModelOffsetX;
  state.arDragStartY  = cy - state.arModelOffsetY;
  document.body.classList.add('ar-drag-active');
}

function onARPointerMove(e) {
  if (e.touches && e.touches.length === 2) {
    // Pinch zoom
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const ratio = dist / state.arPinchStartDist;
    state.arModelScale = Math.min(4.0, Math.max(0.2, state.arPinchStartScale * ratio));
    applyARModelOffset();
    return;
  }

  if (!state.arDragActive) return;
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  const cy = e.touches ? e.touches[0].clientY : e.clientY;
  state.arModelOffsetX = cx - state.arDragStartX;
  state.arModelOffsetY = cy - state.arDragStartY;
  applyARModelOffset();
}

function onARPointerUp() {
  state.arDragActive = false;
  document.body.classList.remove('ar-drag-active');
}

function setupARDragGestures(el) {
  _arDragTarget = el;
  el.addEventListener('touchstart',  onARPointerDown, { passive: true });
  el.addEventListener('touchmove',   onARPointerMove, { passive: true });
  el.addEventListener('touchend',    onARPointerUp,   { passive: true });
  el.addEventListener('mousedown',   onARPointerDown);
  el.addEventListener('mousemove',   onARPointerMove);
  el.addEventListener('mouseup',     onARPointerUp);
}

function removeARDragGestures() {
  if (!_arDragTarget) return;
  _arDragTarget.removeEventListener('touchstart',  onARPointerDown);
  _arDragTarget.removeEventListener('touchmove',   onARPointerMove);
  _arDragTarget.removeEventListener('touchend',    onARPointerUp);
  _arDragTarget.removeEventListener('mousedown',   onARPointerDown);
  _arDragTarget.removeEventListener('mousemove',   onARPointerMove);
  _arDragTarget.removeEventListener('mouseup',     onARPointerUp);
  _arDragTarget = null;
}

/** Main toggle called by the UI buttons */
async function toggleARMode(enableAR) {
  state.arMode = enableAR;
  const grid = scene.getObjectByName('gridHelper');

  if (enableAR) {
    btnModeAR.classList.add('active');
    btnMode3D.classList.remove('active');
    arViewfinder.classList.remove('viewfinder-hidden');
    if (grid) grid.visible = false;

    // Show MindAR container, hide plain Three.js canvas
    mindarContainer.classList.add('active');
    document.body.classList.add('mindar-active');

    await startMindAR();
  } else {
    btnMode3D.classList.add('active');
    btnModeAR.classList.remove('active');
    arViewfinder.classList.add('viewfinder-hidden');
    trackingStatus.textContent = '3D Lab Mode Active';
    if (grid) grid.visible = true;

    // Restore Three.js lab canvas
    document.body.classList.remove('mindar-active');
    mindarContainer.classList.remove('active');

    await stopMindAR();
  }
}

/* ==========================================================================
   6. Speech Synthesis (Text-to-Speech Voice Guide)
   ========================================================================== */
function playVoiceNarration() {
  if (!('speechSynthesis' in window)) {
    alert("Speech Synthesis is not supported in this browser.");
    return;
  }

  if (state.isNarrating) {
    stopNarration();
    return;
  }

  let markerData = null;
  if (state.modulesData) {
    for (const mod of state.modulesData.modules) {
      const m = mod.markers.find(i => i.id === state.activeMarkerId);
      if (m) { markerData = m; break; }
    }
  }

  const textToSpeak = markerData ? markerData.voice_narration : "Exploring 3D educational model.";
  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    state.isNarrating = true;
    btnVoiceNarration.classList.add("playing");
    audioIcon.className = "fas fa-stop";
  };

  utterance.onend = () => {
    stopNarration();
  };

  utterance.onerror = () => {
    stopNarration();
  };

  window.speechSynthesis.speak(utterance);
}

function stopNarration() {
  window.speechSynthesis.cancel();
  state.isNarrating = false;
  btnVoiceNarration.classList.remove("playing");
  audioIcon.className = "fas fa-volume-up";
}

/* ==========================================================================
   7. Speech Recognition (ASR Spoken Question Input)
   ========================================================================== */
function initSpeechRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    btnMicInput.style.display = "none";
    return;
  }

  const recognition = new SpeechRec();
  recognition.continuous = false;
  recognition.lang = 'en-US';

  btnMicInput.addEventListener("click", () => {
    if (state.isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });

  recognition.onstart = () => {
    state.isListening = true;
    btnMicInput.classList.add("recording");
    tutorInputField.placeholder = "Listening to your voice...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    tutorInputField.value = transcript;
    submitTutorMessage(transcript);
  };

  recognition.onend = () => {
    state.isListening = false;
    btnMicInput.classList.remove("recording");
    tutorInputField.placeholder = "Ask a question about this model...";
  };
}

/* ==========================================================================
   8. Socratic AI Tutor Chat Logic
   ========================================================================== */
async function submitTutorMessage(userText) {
  if (!userText.trim()) return;

  // Append user bubble
  appendChatBubble(userText, 'user');
  tutorInputField.value = '';

  // Loading indicator
  const loadingBubble = appendChatBubble("Thinking...", 'tutor', true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        marker_id: state.activeMarkerId,
        message: userText
      })
    });

    if (res.ok) {
      const data = await res.json();
      loadingBubble.remove();
      appendChatBubble(data.reply, 'tutor');
      updateTutorSuggestions(data.suggestions);
    } else {
      throw new Error("Chat request failed");
    }
  } catch (err) {
    loadingBubble.remove();
    appendChatBubble(
      `Here is what you should know about **${markerTitle.textContent}**: ` +
      `Observe the geometric structure in 3D and review the component labels!`,
      'tutor'
    );
  }
}

function appendChatBubble(text, sender, isLoading = false) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  msgDiv.appendChild(bubble);
  tutorMessages.appendChild(msgDiv);
  tutorMessages.scrollTop = tutorMessages.scrollHeight;
  return msgDiv;
}

function updateTutorSuggestions(suggestions) {
  if (!suggestions || !suggestions.length) return;
  tutorSuggestions.innerHTML = '';
  suggestions.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'sugg-chip';
    btn.textContent = s;
    btn.addEventListener('click', () => submitTutorMessage(s));
    tutorSuggestions.appendChild(btn);
  });
}

function openTutorWithPrompt(promptText) {
  tutorDrawer.classList.add('open');
  submitTutorMessage(promptText);
}

/* ==========================================================================
   9. 5-Question Interactive Quiz Engine
   ========================================================================== */
async function openQuizModal() {
  quizModal.classList.add('open');
  quizContainer.style.display = 'block';
  quizResultsPanel.style.display = 'none';
  btnQuizSubmit.style.display = 'none';
  btnQuizRetry.style.display = 'none';
  btnQuizNext.style.display = 'inline-block';
  btnQuizPrev.style.display = 'inline-block';

  state.currentQuestionIndex = 0;
  state.quizAnswers = {};
  state.quizStartTime = Date.now();

  startQuizTimer();

  try {
    const res = await fetch(`/api/quiz/${state.activeMarkerId}`);
    if (res.ok) {
      state.activeQuiz = await res.json();
    } else {
      throw new Error();
    }
  } catch {
    // Fallback quiz if server is unreachable
    state.activeQuiz = {
      marker_id: state.activeMarkerId,
      marker_name: markerTitle.textContent,
      total_questions: 5,
      questions: [
        { id: 0, question: `What is the primary function of ${markerTitle.textContent}?`, options: ["Energy Storage", "Biological / Mechanical Work", "Zero resistance", "Passive mass"] },
        { id: 1, question: `Which scientific law best describes ${markerTitle.textContent}?`, options: ["Newton's Law", "First Principle of thermodynamics", "Conservation law", "Electromagnetic induction"] },
        { id: 2, question: `How do internal components communicate in this structure?`, options: ["Direct physical contact", "Hydrostatic pressure", "Synaptic or mechanical link", "Wireless signal"] },
        { id: 3, question: `What occurs if this structure encounters overload?`, options: ["Immediate shutdown", "Plastic deformation / fatigue", "Thermal expansion", "Efficiency gain"] },
        { id: 4, question: `Why is 3D visualization beneficial for understanding this topic?`, options: ["Reveals spatial orientation", "Replaces textbooks", "Eliminates exams", "Lowers resolution"] }
      ]
    };
  }

  quizMarkerTitle.textContent = `${state.activeQuiz.marker_name} — 5-Question Quiz`;
  renderQuizQuestion();
}

function startQuizTimer() {
  if (state.quizTimerInterval) clearInterval(state.quizTimerInterval);
  state.quizTimerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.quizStartTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    quizTimer.innerHTML = `<i class="fas fa-clock"></i> ${mins}:${secs}`;
  }, 1000);
}

function renderQuizQuestion() {
  const q = state.activeQuiz.questions[state.currentQuestionIndex];
  const total = state.activeQuiz.questions.length;

  quizQNum.textContent = `Question ${state.currentQuestionIndex + 1} of ${total}`;
  quizProgressFill.style.width = `${((state.currentQuestionIndex + 1) / total) * 100}%`;
  quizQuestionText.textContent = q.question;

  quizOptionsContainer.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];

  q.options.forEach((optText, optIdx) => {
    const card = document.createElement('div');
    card.className = 'quiz-option-card';
    if (state.quizAnswers[state.currentQuestionIndex] === optIdx) {
      card.classList.add('selected');
    }

    card.innerHTML = `
      <div class="opt-letter">${letters[optIdx]}</div>
      <div class="opt-label">${optText}</div>
    `;

    card.addEventListener('click', () => {
      state.quizAnswers[state.currentQuestionIndex] = optIdx;
      renderQuizQuestion();
    });

    quizOptionsContainer.appendChild(card);
  });

  btnQuizPrev.disabled = (state.currentQuestionIndex === 0);

  if (state.currentQuestionIndex === total - 1) {
    btnQuizNext.style.display = 'none';
    btnQuizSubmit.style.display = 'inline-block';
  } else {
    btnQuizNext.style.display = 'inline-block';
    btnQuizSubmit.style.display = 'none';
  }
}

async function submitQuiz() {
  clearInterval(state.quizTimerInterval);
  const elapsedSeconds = Math.floor((Date.now() - state.quizStartTime) / 1000);

  // Convert answers to array
  const answersArray = [];
  for (let i = 0; i < state.activeQuiz.questions.length; i++) {
    answersArray.push(state.quizAnswers[i] !== undefined ? state.quizAnswers[i] : null);
  }

  let resultData = null;
  try {
    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        marker_id: state.activeMarkerId,
        answers: answersArray,
        completion_time_seconds: elapsedSeconds
      })
    });
    resultData = await res.json();
  } catch {
    resultData = {
      score_percentage: 80,
      grade: 'A',
      correct_answers: 4,
      total_questions: 5,
      feedback: 'Good work! Review your spatial concepts.'
    };
  }

  // Display results screen
  quizContainer.style.display = 'none';
  quizResultsPanel.style.display = 'block';
  btnQuizSubmit.style.display = 'none';
  btnQuizPrev.style.display = 'none';
  btnQuizRetry.style.display = 'inline-block';

  document.getElementById('score-percentage').textContent = `${resultData.score_percentage}%`;
  document.getElementById('score-grade').textContent = `Grade ${resultData.grade}`;
  document.getElementById('score-feedback-text').textContent = resultData.feedback;
  document.getElementById('score-stats-text').textContent =
    `You answered ${resultData.correct_answers} of ${resultData.total_questions} questions correctly in ${elapsedSeconds}s.`;

  // Render review explanations
  const breakdown = document.getElementById('results-breakdown');
  breakdown.innerHTML = '';
  if (resultData.results) {
    resultData.results.forEach((r, idx) => {
      const card = document.createElement('div');
      card.className = `result-card ${r.is_correct ? 'correct' : 'wrong'}`;
      card.innerHTML = `
        <h4>Q${idx + 1}: ${r.question} ${r.is_correct ? '✓' : '✗'}</h4>
        <p class="result-expl"><strong>Explanation:</strong> ${r.explanation}</p>
      `;
      breakdown.appendChild(card);
    });
  }
}

/* ==========================================================================
   10. Event Listeners Wire-up
   ========================================================================== */
function setupEventListeners() {
  // Mode switches
  btnMode3D.addEventListener('click', () => toggleARMode(false));
  btnModeAR.addEventListener('click', () => toggleARMode(true));

  // Module switcher chips
  document.querySelectorAll('.module-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const markerId = chip.getAttribute('data-marker');
      loadMarker(markerId);
    });
  });

  // Info card collapse
  btnCollapseInfo.addEventListener('click', () => {
    infoCard.classList.toggle('collapsed');
  });

  // Action buttons
  btnVoiceNarration.addEventListener('click', playVoiceNarration);

  btnOpenTutor.addEventListener('click', () => {
    tutorDrawer.classList.toggle('open');
  });

  btnCloseTutor.addEventListener('click', () => {
    tutorDrawer.classList.remove('open');
  });

  btnOpenQuiz.addEventListener('click', openQuizModal);
  btnCloseQuiz.addEventListener('click', () => {
    quizModal.classList.remove('open');
    clearInterval(state.quizTimerInterval);
  });

  // 3D Toolbar
  btnRotateAuto.addEventListener('click', () => {
    state.autoRotate = !state.autoRotate;
    btnRotateAuto.classList.toggle('active', state.autoRotate);
  });

  btnWireframe.addEventListener('click', () => {
    state.wireframe = !state.wireframe;
    btnWireframe.classList.toggle('active', state.wireframe);
    if (activeModelGroup) {
      activeModelGroup.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.wireframe = state.wireframe;
        }
      });
    }
  });

  btnExplodeView.addEventListener('click', () => {
    state.exploded = !state.exploded;
    btnExplodeView.classList.toggle('active', state.exploded);
    if (activeModelGroup) {
      activeModelGroup.children.forEach((c) => {
        if (c.position) {
          if (state.exploded) {
            c.position.multiplyScalar(1.5);
          } else {
            c.position.divideScalar(1.5);
          }
        }
      });
    }
  });

  btnResetCam.addEventListener('click', () => {
    controls.reset();
    camera.position.set(0, 2, 7);
  });

  // Tutor Input Bar
  btnSendTutor.addEventListener('click', () => {
    submitTutorMessage(tutorInputField.value);
  });

  tutorInputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitTutorMessage(tutorInputField.value);
  });

  // Quiz navigation buttons
  btnQuizPrev.addEventListener('click', () => {
    if (state.currentQuestionIndex > 0) {
      state.currentQuestionIndex--;
      renderQuizQuestion();
    }
  });

  btnQuizNext.addEventListener('click', () => {
    if (state.currentQuestionIndex < state.activeQuiz.questions.length - 1) {
      state.currentQuestionIndex++;
      renderQuizQuestion();
    }
  });

  btnQuizSubmit.addEventListener('click', submitQuiz);
  btnQuizRetry.addEventListener('click', openQuizModal);

  // Setup ASR mic
  initSpeechRecognition();
}

// Start application on DOM load
window.addEventListener('DOMContentLoaded', initApp);
