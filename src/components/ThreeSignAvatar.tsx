import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SignDefinition, HandPose } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { 
  Play, Pause, RotateCcw, Eye, Camera, 
  FlipHorizontal, ChevronDown, ChevronUp, 
  Smile, Hand, Sparkles 
} from 'lucide-react';

interface ThreeSignAvatarProps {
  currentSignSequence: { word: string; sign: SignDefinition; isFingerspelled: boolean }[];
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  mirror: boolean;
  onMirrorChange: (mirror: boolean) => void;
  hapticEnabled: boolean;
  activeWordIndex: number;
  onWordIndexChange: (index: number) => void;
}

export const ThreeSignAvatar: React.FC<ThreeSignAvatarProps> = ({
  currentSignSequence,
  isPlaying,
  onPlayStateChange,
  speed,
  onSpeedChange,
  mirror,
  onMirrorChange,
  hapticEnabled,
  activeWordIndex,
  onWordIndexChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraView, setCameraView] = useState<'front' | 'hands' | 'face' | 'angle'>('front');
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  // Animation state reference
  const animStateRef = useRef({
    currentSequence: currentSignSequence,
    isPlaying: isPlaying,
    activeWordIndex: activeWordIndex,
    speed: speed,
    mirror: mirror,
    targetRightPose: null as HandPose | null,
    targetLeftPose: null as HandPose | null,
    targetHeadTilt: [0, 0, 0] as [number, number, number],
    targetMouthOpen: 0,
    targetMouthWidth: 1.0,
    targetBrowsUp: 0,
    targetSmile: 0,
    cameraView: cameraView,
  });

  useEffect(() => {
    animStateRef.current.currentSequence = currentSignSequence;
    animStateRef.current.isPlaying = isPlaying;
    animStateRef.current.activeWordIndex = activeWordIndex;
    animStateRef.current.speed = speed;
    animStateRef.current.mirror = mirror;
    animStateRef.current.cameraView = cameraView;
  }, [currentSignSequence, isPlaying, activeWordIndex, speed, mirror, cameraView]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d); // Deep obsidian studio navy
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.08);

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 0.14, 1.58);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff6ec, 2.4); // Warm key
    keyLight.position.set(1.4, 2.6, 2.2);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0xa5c4f7, 0x1e293b, 1.3); // Cool ambient fill
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6); // Cyan rim light
    rimLight.position.set(-1.8, 1.6, -1.6);
    scene.add(rimLight);

    // Ground Contact Shadow
    const groundGeo = new THREE.PlaneGeometry(5, 5);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.92;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // ========================================================
    // PROCEDURAL 3D HUMANOID RIG WITH ANATOMICAL HANDS & MOUTH
    // ========================================================
    const humanoidGroup = new THREE.Group();
    humanoidGroup.position.set(0, 0, 0);
    scene.add(humanoidGroup);

    // High fidelity PBR Materials
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfb48c, // Warm natural humanoid skin tone
      roughness: 0.58,
      metalness: 0.03,
    });

    const skinShadowMaterial = new THREE.MeshStandardMaterial({
      color: 0xd2a47a, // Joint & shadow skin tone
      roughness: 0.65,
      metalness: 0.02,
    });

    const nailMaterial = new THREE.MeshStandardMaterial({
      color: 0xedd6cb, // Slightly lighter fingernail bed
      roughness: 0.28,
      metalness: 0.1,
    });

    const lipsMaterial = new THREE.MeshStandardMaterial({
      color: 0xb55353, // Natural rosy lip tone
      roughness: 0.45,
      metalness: 0.05,
    });

    const mouthCavityMaterial = new THREE.MeshBasicMaterial({
      color: 0x240707, // Dark interior mouth cavity
    });

    const teethMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Pearl white dental arches
      roughness: 0.2,
      metalness: 0.1,
    });

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Professional navy accessibility polo
      roughness: 0.82,
      metalness: 0.03,
    });

    const collarMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant cyan accessibility accent trim
      roughness: 0.5,
      metalness: 0.1,
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x221f1f, // Dark natural styled hair
      roughness: 0.88,
      metalness: 0.05,
    });

    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.15,
      metalness: 0.05,
    });

    const irisMaterial = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Expressive deep blue-hazel iris
      roughness: 0.2,
      metalness: 0.2,
    });

    const pupilMaterial = new THREE.MeshBasicMaterial({
      color: 0x050505,
    });

    // 1. Torso / Upper Body Bust
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, -0.32, 0);
    humanoidGroup.add(torsoGroup);

    // Sculpted chest & ribcage
    const chestGeo = new THREE.CylinderGeometry(0.25, 0.21, 0.64, 24);
    const chest = new THREE.Mesh(chestGeo, shirtMaterial);
    chest.castShadow = !isSoftwareGl;
    torsoGroup.add(chest);

    // Clavicle & shoulder contour
    const clavicleGeo = new THREE.BoxGeometry(0.52, 0.08, 0.24);
    const clavicle = new THREE.Mesh(clavicleGeo, shirtMaterial);
    clavicle.position.set(0, 0.28, 0);
    clavicle.castShadow = !isSoftwareGl;
    torsoGroup.add(clavicle);

    // Collar neckline
    const collarGeo = new THREE.TorusGeometry(0.125, 0.022, 14, 28);
    const collar = new THREE.Mesh(collarGeo, collarMaterial);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.32, 0.02);
    torsoGroup.add(collar);

    // 2. Anatomical Neck
    const neckGeo = new THREE.CylinderGeometry(0.082, 0.095, 0.16, 20);
    const neck = new THREE.Mesh(neckGeo, skinShadowMaterial);
    neck.position.set(0, 0.055, 0);
    humanoidGroup.add(neck);

    // 3. Humanoid Head with Expressive Face & Rigged Mouth
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.22, 0);
    humanoidGroup.add(headGroup);

    // Cranium / Face base
    const headGeo = new THREE.SphereGeometry(0.165, 28, 28);
    headGeo.scale(1.0, 1.18, 1.08);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    head.castShadow = !isSoftwareGl;
    headGroup.add(head);

    // Sculpted Chin & Jawline
    const chinGeo = new THREE.BoxGeometry(0.085, 0.06, 0.08);
    const chin = new THREE.Mesh(chinGeo, skinMaterial);
    chin.position.set(0, -0.12, 0.1);
    chin.rotation.x = 0.25;
    headGroup.add(chin);

    // Sculpted Nose with bridge and nostrils
    const noseGroup = new THREE.Group();
    noseGroup.position.set(0, 0.0, 0.165);
    headGroup.add(noseGroup);

    const noseBridgeGeo = new THREE.ConeGeometry(0.022, 0.07, 12);
    const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMaterial);
    noseBridge.rotation.x = Math.PI * 0.92;
    noseBridge.position.set(0, 0.02, 0);
    noseGroup.add(noseBridge);

    const noseTipGeo = new THREE.SphereGeometry(0.018, 12, 12);
    const noseTip = new THREE.Mesh(noseTipGeo, skinMaterial);
    noseTip.position.set(0, -0.015, 0.01);
    noseGroup.add(noseTip);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.035, 12, 12);
    earGeo.scale(0.4, 1.0, 0.6);
    const leftEar = new THREE.Mesh(earGeo, skinMaterial);
    leftEar.position.set(-0.165, 0.01, -0.02);
    leftEar.rotation.y = -0.2;
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMaterial);
    rightEar.position.set(0.165, 0.01, -0.02);
    rightEar.rotation.y = 0.2;
    headGroup.add(rightEar);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.174, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const hair = new THREE.Mesh(hairGeo, hairMaterial);
    hair.position.set(0, 0.03, -0.02);
    headGroup.add(hair);

    const hairBangsGeo = new THREE.TorusGeometry(0.11, 0.028, 12, 24, Math.PI * 0.7);
    const hairBangs = new THREE.Mesh(hairBangsGeo, hairMaterial);
    hairBangs.position.set(-0.02, 0.14, 0.11);
    hairBangs.rotation.z = -0.3;
    headGroup.add(hairBangs);

    // Eyes
    function createHumanoidEye(isRight: boolean) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(isRight ? 0.065 : -0.065, 0.035, 0.146);

      const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), eyeWhiteMaterial);
      eyeGroup.add(eyeBall);

      const iris = new THREE.Mesh(new THREE.CircleGeometry(0.011, 16), irisMaterial);
      iris.position.set(0, 0, 0.021);
      eyeGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.005, 12), pupilMaterial);
      pupil.position.set(0, 0, 0.0215);
      eyeGroup.add(pupil);

      const eyelidGeo = new THREE.SphereGeometry(0.023, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const eyelid = new THREE.Mesh(eyelidGeo, skinMaterial);
      eyelid.rotation.x = -Math.PI * 0.28;
      eyeGroup.add(eyelid);

      return { group: eyeGroup, eyelid };
    }

    const leftEye = createHumanoidEye(false);
    headGroup.add(leftEye.group);

    const rightEye = createHumanoidEye(true);
    headGroup.add(rightEye.group);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.052, 0.01, 0.015);
    const leftBrow = new THREE.Mesh(browGeo, hairMaterial);
    leftBrow.position.set(-0.065, 0.076, 0.155);
    leftBrow.rotation.z = 0.08;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, hairMaterial);
    rightBrow.position.set(0.065, 0.076, 0.155);
    rightBrow.rotation.z = -0.08;
    headGroup.add(rightBrow);

    // ==========================================
    // RIGGED HUMANOID 3D MOUTH & ORAL CAVITY
    // ==========================================
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.068, 0.152);
    headGroup.add(mouthGroup);

    const cavityGeo = new THREE.BoxGeometry(0.052, 0.026, 0.02);
    const mouthCavity = new THREE.Mesh(cavityGeo, mouthCavityMaterial);
    mouthCavity.position.set(0, 0, -0.005);
    mouthGroup.add(mouthCavity);

    const upperTeethGeo = new THREE.BoxGeometry(0.042, 0.008, 0.012);
    const upperTeeth = new THREE.Mesh(upperTeethGeo, teethMaterial);
    upperTeeth.position.set(0, 0.007, 0.002);
    mouthGroup.add(upperTeeth);

    const lowerTeethGeo = new THREE.BoxGeometry(0.038, 0.007, 0.012);
    const lowerTeeth = new THREE.Mesh(lowerTeethGeo, teethMaterial);
    lowerTeeth.position.set(0, -0.007, 0.002);
    mouthGroup.add(lowerTeeth);

    // Upper Lip
    const upperLipGroup = new THREE.Group();
    upperLipGroup.position.set(0, 0.008, 0.006);
    mouthGroup.add(upperLipGroup);

    const upperLipGeo = new THREE.TorusGeometry(0.026, 0.006, 10, 24, Math.PI * 0.95);
    const upperLip = new THREE.Mesh(upperLipGeo, lipsMaterial);
    upperLip.rotation.x = Math.PI * 0.45;
    upperLip.rotation.z = -Math.PI * 0.02;
    upperLipGroup.add(upperLip);

    // Lower Lip
    const lowerLipGroup = new THREE.Group();
    lowerLipGroup.position.set(0, -0.008, 0.006);
    mouthGroup.add(lowerLipGroup);

    const lowerLipGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.045, 12);
    const lowerLip = new THREE.Mesh(lowerLipGeo, lipsMaterial);
    lowerLip.rotation.z = Math.PI / 2;
    lowerLipGroup.add(lowerLip);

    // ========================================================
    // ARTICULATED 5-FINGER HUMAN HAND WITH PROMINENT FRONT VIEW
    // ========================================================
    function createArticulatedHumanoidHand(isRight: boolean) {
      const handGroup = new THREE.Group();

      // Sculpted Palm
      const palmGeo = new THREE.BoxGeometry(0.088, 0.10, 0.026);
      const palm = new THREE.Mesh(palmGeo, skinMaterial);
      palm.position.set(0, 0, 0);
      palm.castShadow = !isSoftwareGl;
      handGroup.add(palm);

      // Thenar eminence (Thumb base mound)
      const thenarGeo = new THREE.SphereGeometry(0.026, 12, 12);
      thenarGeo.scale(0.85, 1.25, 0.65);
      const thenar = new THREE.Mesh(thenarGeo, skinShadowMaterial);
      thenar.position.set(isRight ? -0.032 : 0.032, -0.02, 0.014);
      handGroup.add(thenar);

      // Wrist cuff
      const wristCuffGeo = new THREE.CylinderGeometry(0.042, 0.044, 0.028, 16);
      const wristCuff = new THREE.Mesh(wristCuffGeo, collarMaterial);
      wristCuff.position.set(0, -0.058, 0);
      handGroup.add(wristCuff);

      // 5 Articulated Fingers (Thumb, Index, Middle, Ring, Pinky)
      const fingerWidth = 0.0145;
      const fingerConfigs = [
        // 0: THUMB (Opposable angle, wide base)
        { 
          len: 0.042, 
          x: isRight ? -0.048 : 0.048, 
          y: -0.012, 
          rotZ: isRight ? 0.52 : -0.52, 
          isThumb: true 
        },
        // 1: INDEX
        { len: 0.052, x: isRight ? -0.028 : 0.028, y: 0.055, rotZ: 0.0, isThumb: false },
        // 2: MIDDLE (Longest finger)
        { len: 0.058, x: 0.0, y: 0.058, rotZ: 0.0, isThumb: false },
        // 3: RING
        { len: 0.052, x: isRight ? 0.026 : -0.026, y: 0.054, rotZ: 0.0, isThumb: false },
        // 4: PINKY
        { len: 0.044, x: isRight ? 0.046 : -0.046, y: 0.046, rotZ: isRight ? -0.08 : 0.08, isThumb: false },
      ];

      const fingers: {
        root: THREE.Group;
        knuckle: THREE.Group;
        midJoint: THREE.Group;
        distJoint: THREE.Group;
        isThumb: boolean;
        baseRotZ: number;
      }[] = [];

      fingerConfigs.forEach(cfg => {
        // Knuckle root
        const rootGroup = new THREE.Group();
        rootGroup.position.set(cfg.x, cfg.y, 0);
        rootGroup.rotation.z = cfg.rotZ;
        handGroup.add(rootGroup);

        // Knuckle joint sphere
        const knuckleGeo = new THREE.SphereGeometry(fingerWidth * 0.95, 10, 10);
        const knuckle = new THREE.Mesh(knuckleGeo, skinShadowMaterial);
        rootGroup.add(knuckle);

        // Proximal phalanx (1st bone)
        const proxLen = cfg.len * 0.46;
        const proxGeo = new THREE.CylinderGeometry(fingerWidth * 0.88, fingerWidth * 0.95, proxLen, 10);
        const prox = new THREE.Mesh(proxGeo, skinMaterial);
        prox.position.set(0, proxLen * 0.5, 0);
        prox.castShadow = !isSoftwareGl;
        rootGroup.add(prox);

        // Mid Joint (PIP joint)
        const midJointGroup = new THREE.Group();
        midJointGroup.position.set(0, proxLen, 0);
        rootGroup.add(midJointGroup);

        const midSphere = new THREE.Mesh(new THREE.SphereGeometry(fingerWidth * 0.82, 8, 8), skinShadowMaterial);
        midJointGroup.add(midSphere);

        // Intermediate phalanx (2nd bone)
        const midLen = cfg.len * 0.32;
        const midGeo = new THREE.CylinderGeometry(fingerWidth * 0.78, fingerWidth * 0.85, midLen, 10);
        const midBone = new THREE.Mesh(midGeo, skinMaterial);
        midBone.position.set(0, midLen * 0.5, 0);
        midJointGroup.add(midBone);

        // Distal Joint (DIP joint)
        const distJointGroup = new THREE.Group();
        distJointGroup.position.set(0, midLen, 0);
        midJointGroup.add(distJointGroup);

        // Distal phalanx (fingertip)
        const tipLen = cfg.len * 0.26;
        const tipGeo = new THREE.CylinderGeometry(fingerWidth * 0.65, fingerWidth * 0.75, tipLen, 10);
        const tipBone = new THREE.Mesh(tipGeo, skinMaterial);
        tipBone.position.set(0, tipLen * 0.5, 0);
        distJointGroup.add(tipBone);

        // Fingernail plate
        const nailGeo = new THREE.BoxGeometry(fingerWidth * 0.65, tipLen * 0.55, 0.0035);
        const nail = new THREE.Mesh(nailGeo, nailMaterial);
        nail.position.set(0, tipLen * 0.52, fingerWidth * 0.68);
        distJointGroup.add(nail);

        fingers.push({
          root: rootGroup,
          knuckle: rootGroup,
          midJoint: midJointGroup,
          distJoint: distJointGroup,
          isThumb: cfg.isThumb,
          baseRotZ: cfg.rotZ,
        });
      });

      return { group: handGroup, fingers };
    }

    // ========================================================
    // ARM RIGGING WITH GUARANTEED FRONT-CHEST POSITIONING
    // ========================================================
    // RIGHT ARM RIG
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.24, -0.04, 0.05); // Shoulder anchor positioned slightly forward
    humanoidGroup.add(rightArmGroup);

    const shoulderCapGeo = new THREE.SphereGeometry(0.068, 16, 16);
    const rightShoulderCap = new THREE.Mesh(shoulderCapGeo, shirtMaterial);
    rightArmGroup.add(rightShoulderCap);

    const rightUpperArmGeo = new THREE.CylinderGeometry(0.052, 0.044, 0.26, 14);
    const rightUpperArm = new THREE.Mesh(rightUpperArmGeo, shirtMaterial);
    rightUpperArm.position.set(0, -0.13, 0);
    rightArmGroup.add(rightUpperArm);

    // Elbow anchor
    const rightForearmGroup = new THREE.Group();
    rightForearmGroup.position.set(0, -0.26, 0);
    rightArmGroup.add(rightForearmGroup);

    const rightElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 12), skinShadowMaterial);
    rightForearmGroup.add(rightElbowJoint);

    const rightForearmGeo = new THREE.CylinderGeometry(0.042, 0.036, 0.24, 14);
    const rightForearm = new THREE.Mesh(rightForearmGeo, skinMaterial);
    rightForearm.position.set(0, -0.12, 0);
    rightForearmGroup.add(rightForearm);

    // Wrist anchor & Articulated Hand
    const rightHandData = createArticulatedHumanoidHand(true);
    rightHandData.group.position.set(0, -0.24, 0);
    rightForearmGroup.add(rightHandData.group);

    // LEFT ARM RIG
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.24, -0.04, 0.05); // Left shoulder anchor
    humanoidGroup.add(leftArmGroup);

    const leftShoulderCap = new THREE.Mesh(shoulderCapGeo, shirtMaterial);
    leftArmGroup.add(leftShoulderCap);

    const leftUpperArmGeo = new THREE.CylinderGeometry(0.052, 0.044, 0.26, 14);
    const leftUpperArm = new THREE.Mesh(leftUpperArmGeo, shirtMaterial);
    leftUpperArm.position.set(0, -0.13, 0);
    leftArmGroup.add(leftUpperArm);

    // Left Elbow anchor
    const leftForearmGroup = new THREE.Group();
    leftForearmGroup.position.set(0, -0.26, 0);
    leftArmGroup.add(leftForearmGroup);

    const leftElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 12), skinShadowMaterial);
    leftForearmGroup.add(leftElbowJoint);

    const leftForearmGeo = new THREE.CylinderGeometry(0.042, 0.036, 0.24, 14);
    const leftForearm = new THREE.Mesh(leftForearmGeo, skinMaterial);
    leftForearm.position.set(0, -0.12, 0);
    leftForearmGroup.add(leftForearm);

    // Left Wrist anchor & Articulated Hand
    const leftHandData = createArticulatedHumanoidHand(false);
    leftHandData.group.position.set(0, -0.24, 0);
    leftForearmGroup.add(leftHandData.group);

    // Finger curl & spread kinematics
    function applyFingerBendsAndSpread(
      fingers: typeof rightHandData.fingers, 
      curls: [number, number, number, number, number],
      spreads?: [number, number, number, number, number]
    ) {
      curls.forEach((curlVal, idx) => {
        const finger = fingers[idx];
        if (!finger) return;

        if (finger.isThumb) {
          const thumbBend = curlVal * (Math.PI * 0.45);
          finger.root.rotation.x = THREE.MathUtils.damp(finger.root.rotation.x, thumbBend * 0.4, 12, 0.03);
          finger.root.rotation.y = THREE.MathUtils.damp(finger.root.rotation.y, (1 - curlVal) * 0.35, 12, 0.03);
          finger.midJoint.rotation.x = THREE.MathUtils.damp(finger.midJoint.rotation.x, thumbBend * 0.65, 12, 0.03);
          finger.distJoint.rotation.x = THREE.MathUtils.damp(finger.distJoint.rotation.x, thumbBend * 0.55, 12, 0.03);
        } else {
          const totalAngle = curlVal * (Math.PI * 0.55);
          finger.root.rotation.x = THREE.MathUtils.damp(finger.root.rotation.x, totalAngle * 0.45, 12, 0.03);
          finger.midJoint.rotation.x = THREE.MathUtils.damp(finger.midJoint.rotation.x, totalAngle * 0.4, 12, 0.03);
          finger.distJoint.rotation.x = THREE.MathUtils.damp(finger.distJoint.rotation.x, totalAngle * 0.3, 12, 0.03);
        }

        if (spreads && spreads[idx] !== undefined) {
          finger.root.rotation.z = THREE.MathUtils.damp(
            finger.root.rotation.z, 
            finger.baseRotZ + spreads[idx], 
            12, 
            0.03
          );
        }
      });
    }

    // Default rest anatomical poses:
    // Held comfortably in FRONT of the lower chest (Z > 0), palms facing the viewer
    const defaultRightPose: HandPose = {
      thumb: 0.15, index: 0.18, middle: 0.22, ring: 0.25, pinky: 0.28,
      wristRotation: [1.35, 0.2, -0.2],
      armPosition: [0.18, -0.05, 0.35],
      armRotation: [-0.35, 0.15, -0.25],
    };

    const defaultLeftPose: HandPose = {
      thumb: 0.15, index: 0.18, middle: 0.22, ring: 0.25, pinky: 0.28,
      wristRotation: [1.35, -0.2, 0.2],
      armPosition: [-0.18, -0.05, 0.35],
      armRotation: [-0.35, -0.15, 0.25],
    };

    // Main animation loop
    let frameId = 0;
    let signElapsed = 0;
    let currentKeyframeIndex = 0;
    let blinkTimer = 0;

    const clock = new THREE.Clock();

    function animate() {
      frameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const state = animStateRef.current;
      const elapsedTime = clock.getElapsedTime();

      // Camera viewpoint dampening (Perfect front-framing)
      if (state.cameraView === 'front') {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.14, 5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, 1.58, 5, delta);
        camera.lookAt(0, 0.04, 0.15);
      } else if (state.cameraView === 'hands') {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, 0.08, 5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.02, 5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, 1.05, 5, delta);
        camera.lookAt(0.06, 0.0, 0.32);
      } else if (state.cameraView === 'face') {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.22, 5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, 0.82, 5, delta);
        camera.lookAt(0, 0.18, 0.05);
      } else if (state.cameraView === 'angle') {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, 0.55, 5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.22, 5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, 1.50, 5, delta);
        camera.lookAt(0, 0.08, 0.15);
      }

      // Mirror mode toggle
      humanoidGroup.scale.x = state.mirror ? -1 : 1;

      // Spontaneous natural blinking
      blinkTimer += delta;
      if (blinkTimer > 3.8) {
        const blinkPhase = Math.sin((blinkTimer - 3.8) * Math.PI * 5);
        if (blinkPhase > 0) {
          leftEye.eyelid.rotation.x = -Math.PI * 0.28 + blinkPhase * 0.75;
          rightEye.eyelid.rotation.x = -Math.PI * 0.28 + blinkPhase * 0.75;
        } else {
          blinkTimer = 0;
        }
      }

      // Active Translation Sequence Execution
      if (state.isPlaying && state.currentSequence.length > 0) {
        const item = state.currentSequence[state.activeWordIndex];
        if (item) {
          const signDef = item.sign;
          const totalDuration = (signDef.durationMs || 1000) / state.speed;

          signElapsed += delta * 1000;

          // Keyframe interpolation
          const keyframes = signDef.keyframes;
          if (keyframes && keyframes.length > 0) {
            const progress = Math.min(1.0, signElapsed / totalDuration);
            const activeKf = keyframes[Math.min(currentKeyframeIndex, keyframes.length - 1)];

            if (activeKf) {
              state.targetRightPose = activeKf.rightHand;
              state.targetLeftPose = activeKf.leftHand || null;
              state.targetHeadTilt = activeKf.headTilt || [0, 0, 0];

              if (activeKf.expression === 'smile') {
                state.targetSmile = 0.25;
                state.targetBrowsUp = 0.08;
              } else if (activeKf.expression === 'question') {
                state.targetBrowsUp = -0.16;
                state.targetSmile = 0.0;
              } else if (activeKf.expression === 'nod') {
                state.targetSmile = 0.12;
                state.targetBrowsUp = 0.02;
              } else {
                state.targetSmile = 0.05;
                state.targetBrowsUp = 0.0;
              }

              // Dynamic Human Mouth Visemes
              const mouthCycle = Math.sin(progress * Math.PI * 6);
              state.targetMouthOpen = Math.max(0.08, Math.abs(mouthCycle) * 0.42);
              state.targetMouthWidth = 1.0 + Math.sin(progress * Math.PI * 3) * 0.18;
            }

            if (keyframes.length > 1 && progress > (currentKeyframeIndex + 1) / keyframes.length) {
              currentKeyframeIndex = Math.min(keyframes.length - 1, currentKeyframeIndex + 1);
            }

            if (signElapsed >= totalDuration) {
              signElapsed = 0;
              currentKeyframeIndex = 0;

              triggerHaptic('signComplete', hapticEnabled);

              if (state.activeWordIndex < state.currentSequence.length - 1) {
                const nextIdx = state.activeWordIndex + 1;
                onWordIndexChange(nextIdx);
              } else {
                onPlayStateChange(false);
              }
            }
          }
        }
      } else {
        // Idle breathing & natural postural sway
        const breath = Math.sin(elapsedTime * 1.8) * 0.012;
        torsoGroup.position.y = -0.32 + breath;

        state.targetRightPose = defaultRightPose;
        state.targetLeftPose = defaultLeftPose;
        state.targetHeadTilt = [breath * 0.7, Math.sin(elapsedTime * 0.6) * 0.035, 0];
        state.targetMouthOpen = 0.02;
        state.targetMouthWidth = 1.0;
        state.targetSmile = 0.04;
        state.targetBrowsUp = 0.0;
      }

      // =========================================================================
      // FORWARD KINEMATICS: HANDS & 5 FINGERS ARE ALWAYS PROMINENTLY IN FRONT
      // =========================================================================
      const rp = state.targetRightPose || defaultRightPose;
      applyFingerBendsAndSpread(
        rightHandData.fingers, 
        [rp.thumb, rp.index, rp.middle, rp.ring, rp.pinky],
        rp.spread
      );

      // Shoulder rotates forward towards +Z
      const targetShoulderRotX = -Math.abs(rp.armRotation[0] || 0.4) * 0.65;
      rightArmGroup.rotation.x = THREE.MathUtils.damp(rightArmGroup.rotation.x, targetShoulderRotX, 11, delta);
      rightArmGroup.rotation.y = THREE.MathUtils.damp(rightArmGroup.rotation.y, (rp.armRotation[1] || 0.1), 11, delta);
      rightArmGroup.rotation.z = THREE.MathUtils.damp(rightArmGroup.rotation.z, (rp.armRotation[2] || -0.2), 11, delta);

      // Elbow flexes forward: negative rotation on X swings forearm forward into +Z space
      const isHighSign = (rp.armPosition && rp.armPosition[1] > 0.0) || targetShoulderRotX < -0.55;
      const targetElbowFlex = isHighSign ? -1.85 : -1.45;
      rightForearmGroup.rotation.x = THREE.MathUtils.damp(rightForearmGroup.rotation.x, targetElbowFlex, 11, delta);

      // Wrist rotates hand upright (+Y) and adjusts orientation to face the viewer
      const targetWristX = Math.PI * 0.48 + (rp.wristRotation[0] || 0);
      rightHandData.group.rotation.x = THREE.MathUtils.damp(rightHandData.group.rotation.x, targetWristX, 12, delta);
      rightHandData.group.rotation.y = THREE.MathUtils.damp(rightHandData.group.rotation.y, (rp.wristRotation[1] || 0.2), 12, delta);
      rightHandData.group.rotation.z = THREE.MathUtils.damp(rightHandData.group.rotation.z, (rp.wristRotation[2] || -0.2), 12, delta);

      // Left Hand & Arm (Left side of chest)
      const lp = state.targetLeftPose || defaultLeftPose;
      applyFingerBendsAndSpread(
        leftHandData.fingers, 
        [lp.thumb, lp.index, lp.middle, lp.ring, lp.pinky],
        lp.spread
      );

      const targetLeftShoulderRotX = -Math.abs(lp.armRotation[0] || 0.4) * 0.65;
      leftArmGroup.rotation.x = THREE.MathUtils.damp(leftArmGroup.rotation.x, targetLeftShoulderRotX, 11, delta);
      leftArmGroup.rotation.y = THREE.MathUtils.damp(leftArmGroup.rotation.y, (lp.armRotation[1] || -0.1), 11, delta);
      leftArmGroup.rotation.z = THREE.MathUtils.damp(leftArmGroup.rotation.z, (lp.armRotation[2] || 0.2), 11, delta);

      const isLeftHigh = lp.armPosition && lp.armPosition[1] > 0.0;
      const targetLeftElbowFlex = isLeftHigh ? -1.85 : -1.45;
      leftForearmGroup.rotation.x = THREE.MathUtils.damp(leftForearmGroup.rotation.x, targetLeftElbowFlex, 11, delta);

      const targetLeftWristX = Math.PI * 0.48 + (lp.wristRotation[0] || 0);
      leftHandData.group.rotation.x = THREE.MathUtils.damp(leftHandData.group.rotation.x, targetLeftWristX, 12, delta);
      leftHandData.group.rotation.y = THREE.MathUtils.damp(leftHandData.group.rotation.y, (lp.wristRotation[1] || -0.2), 12, delta);
      leftHandData.group.rotation.z = THREE.MathUtils.damp(leftHandData.group.rotation.z, (lp.wristRotation[2] || 0.2), 12, delta);

      // Head Tilts & Rotation
      headGroup.rotation.x = THREE.MathUtils.damp(headGroup.rotation.x, state.targetHeadTilt[0], 10, delta);
      headGroup.rotation.y = THREE.MathUtils.damp(headGroup.rotation.y, state.targetHeadTilt[1], 10, delta);
      headGroup.rotation.z = THREE.MathUtils.damp(headGroup.rotation.z, state.targetHeadTilt[2], 10, delta);

      // Eyebrows
      leftBrow.position.y = THREE.MathUtils.damp(leftBrow.position.y, 0.076 + state.targetBrowsUp * 0.02, 12, delta);
      rightBrow.position.y = THREE.MathUtils.damp(rightBrow.position.y, 0.076 + state.targetBrowsUp * 0.02, 12, delta);

      // Mouth & Lips
      const mouthHeight = Math.max(0.2, state.targetMouthOpen * 2.8);
      mouthGroup.scale.y = THREE.MathUtils.damp(mouthGroup.scale.y, mouthHeight, 14, delta);
      mouthGroup.scale.x = THREE.MathUtils.damp(mouthGroup.scale.x, state.targetMouthWidth, 14, delta);

      upperLipGroup.position.y = THREE.MathUtils.damp(upperLipGroup.position.y, 0.008 + state.targetMouthOpen * 0.012, 14, delta);
      lowerLipGroup.position.y = THREE.MathUtils.damp(lowerLipGroup.position.y, -0.008 - state.targetMouthOpen * 0.015, 14, delta);

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const activeItem = currentSignSequence[activeWordIndex];

  return (
    <div className="relative w-full h-[470px] md:h-[530px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between">
      {/* 3D WebGL Canvas Mount */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top HUD: Status, Gloss & Camera Perspective Toggles */}
      <div className="relative z-10 p-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-full px-3.5 py-1.5 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-bold text-slate-200 tracking-wide">
            3D Humanoid Avatar (5 Fingers Front)
          </span>
          {activeItem && (
            <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium">
              Gloss: {activeItem.sign.gloss}
            </span>
          )}
        </div>

        {/* Camera Views Quick Switch */}
        <div className="pointer-events-auto flex items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1 gap-1 shadow-lg">
          {[
            { id: 'front', label: 'Front Bust', icon: Camera },
            { id: 'hands', label: 'Hands & 5 Fingers', icon: Hand },
            { id: 'face', label: 'Face & Mouth', icon: Smile },
            { id: 'angle', label: '45° Depth', icon: Eye },
          ].map((view) => {
            const Icon = view.icon;
            const isSelected = cameraView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => {
                  setCameraView(view.id as typeof cameraView);
                  triggerHaptic('tick', hapticEnabled);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
                  isSelected 
                    ? 'bg-sky-500 text-white font-bold shadow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title={`Switch camera to ${view.label}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{view.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Active Caption & Mouthing Badge */}
      {activeItem && (
        <div className="relative z-10 self-center pointer-events-none mb-2">
          <div className="bg-slate-900/95 border border-sky-500/50 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-xl md:text-2xl font-black text-white tracking-wide">
                {activeItem.word}
              </span>
              <span className="text-[10px] text-sky-300 font-mono flex items-center gap-1 mt-0.5">
                <Smile className="w-3 h-3 text-sky-400" /> Mouthing: "{activeItem.word.toLowerCase()}"
              </span>
            </div>
            {activeItem.isFingerspelled && (
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md self-center">
                Fingerspelled
              </span>
            )}
          </div>
        </div>
      )}

      {/* Ergonomic Collapsible Bottom Control Dock */}
      <div className="relative z-10 w-full p-3 pointer-events-none flex flex-col items-center">
        {/* Toggle Collapse */}
        <button
          onClick={() => {
            setControlsCollapsed(!controlsCollapsed);
            triggerHaptic('tick', hapticEnabled);
          }}
          className="pointer-events-auto mb-1.5 px-3 py-1 bg-slate-900/90 border border-slate-700/80 rounded-full text-slate-300 text-xs font-medium flex items-center gap-1.5 shadow-md hover:bg-slate-800 transition-colors"
          aria-label={controlsCollapsed ? 'Show Controls' : 'Hide Controls'}
        >
          {controlsCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" /> Show Controls
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> Hide Controls
            </>
          )}
        </button>

        {!controlsCollapsed && (
          <div className="pointer-events-auto w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl">
            {/* Scrubber of current sign tokens */}
            {currentSignSequence.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2.5 scrollbar-thin scrollbar-thumb-slate-700">
                {currentSignSequence.map((item, idx) => (
                  <button
                    key={`${item.word}-${idx}`}
                    onClick={() => {
                      onWordIndexChange(idx);
                      triggerHaptic('tick', hapticEnabled);
                    }}
                    className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
                      activeWordIndex === idx
                        ? 'bg-sky-500 text-white font-bold ring-2 ring-sky-300 shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.isFingerspelled ? `[${item.word}]` : item.sign.gloss}
                  </button>
                ))}
              </div>
            )}

            {/* Play, Speed, and Mirror Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onPlayStateChange(!isPlaying);
                    triggerHaptic('startSigning', hapticEnabled);
                  }}
                  className={`p-2.5 rounded-xl font-bold flex items-center gap-2 text-xs transition-colors ${
                    isPlaying 
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'bg-sky-500 hover:bg-sky-600 text-white shadow-md'
                  }`}
                  aria-label={isPlaying ? 'Pause signing animation' : 'Play signing animation'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Translate & Sign'}</span>
                </button>

                <button
                  onClick={() => {
                    onWordIndexChange(0);
                    onPlayStateChange(true);
                    triggerHaptic('tick', hapticEnabled);
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Replay from start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed & Mirror */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-800/80 rounded-xl p-1 gap-1">
                  {[0.5, 1.0, 1.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        onSpeedChange(s);
                        triggerHaptic('tick', hapticEnabled);
                      }}
                      className={`px-2.5 py-0.5 text-xs font-mono rounded-lg transition-colors ${
                        speed === s ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                      title={`${s}x Speed`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    onMirrorChange(!mirror);
                    triggerHaptic('tick', hapticEnabled);
                  }}
                  className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    mirror
                      ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Mirror Signing Perspective for Learners"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Mirror</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
