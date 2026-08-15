import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  RotateCcw,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import CertificateStory from './CertificateStory';
import { shareOrDownloadCertificate } from '../utils/exportToImage';
import { submitScore } from '../utils/leaderboard';
import {
  playCoinSound,
  playCountdownSound,
  playFinishSound,
  playHitSound,
  playJumpSound,
  playLaneSound,
  unlockSound,
} from '../utils/soundEffects';

const LANES = [-4.5, -1.5, 1.5, 4.5];
const LANE_COUNT = 4;
const TOTAL_TIME = 22;
const INITIAL_SPEED = 28;
const MAX_SPEED = 65;
const JUMP_GRAVITY = -45;
const JUMP_FORCE = 16.5;
const MAX_TIME = 30;
const START_GRACE_SECONDS = 2.4;

function getVerdict(score) {
  if (score >= 7600) return 'Juara Stadion Merdeka';
  if (score >= 6200) return 'Sprinter Merah Putih';
  if (score >= 4700) return 'Pelari Tribun Favorit';
  if (score >= 3200) return 'Finisher Penuh Semangat';
  return 'Masih Pemanasan Stadion';
}

function getScoreMultiplier(distance) {
  return Math.min(5, 1 + Math.floor(distance / 180));
}

export default function MerdekaRunGame({ playerName, region, onExit }) {
  const containerRef = useRef(null);
  const animationFrameRef = useRef(0);
  const resizeCleanupRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const submittedRef = useRef(false);

  const engineRef = useRef(null);
  const controlsRef = useRef({ startX: 0, startY: 0 });
  const phaseRef = useRef('countdown');
  const soundEnabledRef = useRef(true);
  const collisionLockRef = useRef(false);

  const [phase, setPhase] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [lives, setLives] = useState(3);
  const [speedKmh, setSpeedKmh] = useState(INITIAL_SPEED);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [currentLane, setCurrentLane] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState('');
  const [bonusCount, setBonusCount] = useState(0);
  const [submitState, setSubmitState] = useState('idle');
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const engine = engineRef.current;
    const container = containerRef.current;

    if (!engine || !container || phase === 'finished') return;

    if (!container.contains(engine.renderer.domElement)) {
      container.appendChild(engine.renderer.domElement);
      engine.camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
      engine.camera.updateProjectionMatrix();
      engine.renderer.setSize(container.clientWidth, container.clientHeight);
    }
  }, [phase]);

  const showToast = (message) => {
    window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(''), 1200);
  };

  const adjustTime = (delta, reason) => {
    let nextValue = TOTAL_TIME;

    setTimeLeft((prev) => {
      nextValue = Math.max(0, Math.min(MAX_TIME, prev + delta));
      return nextValue;
    });

    if (reason) {
      showToast(reason);
    }

    if (nextValue <= 0) {
      finishGame();
    }
  };

  const syncHud = () => {
    const engine = engineRef.current;
    if (!engine) return;

    setScore(Math.round(engine.score));
    setDistance(Math.round(engine.distance));
    setLives(engine.lives);
    setCurrentLane(engine.currentLane);
    setSpeedKmh(Math.floor(engine.gameSpeed));
    setBonusCount(engine.bonusCount);
  };

  const resetRunnerPose = (engine) => {
    engine.playerGroup.position.x = LANES[1];
    engine.playerGroup.position.y = 0;
    engine.playerTargetX = LANES[1];
    engine.playerY = 0;
    engine.playerVY = 0;
    engine.isJumping = false;
    engine.leftLeg.rotation.x = 0;
    engine.rightLeg.rotation.x = 0;
    engine.leftArm.rotation.x = 0;
    engine.rightArm.rotation.x = 0;
    engine.camera.position.set(0, 4.2, 8.5);
    engine.camera.lookAt(0, 1.8, -15);
  };

  const finishGame = () => {
    if (!engineRef.current || phaseRef.current === 'finished') return;

    phaseRef.current = 'finished';
    setPhase('finished');
    window.clearInterval(gameTimerRef.current);
    window.clearTimeout(countdownTimerRef.current);
    if (soundEnabledRef.current) {
      playFinishSound();
    }
    confetti({ particleCount: 180, spread: 82, origin: { y: 0.62 } });
    syncHud();
  };

  const updateHeartsState = (nextLives) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.lives = nextLives;
    setLives(nextLives);
    if (nextLives <= 0) {
      finishGame();
    }
  };

  const handleCollision = () => {
    const engine = engineRef.current;
    if (!engine || phaseRef.current !== 'playing') return;
    if (collisionLockRef.current) return;

    collisionLockRef.current = true;
    window.setTimeout(() => {
      collisionLockRef.current = false;
    }, 650);

    if (soundEnabledRef.current) {
      playHitSound();
    }

    engine.score = Math.max(0, engine.score - 220);
    const nextLives = Math.max(0, engine.lives - 1);
    adjustTime(-2, '-2 detik kena rintangan!');

    engine.camera.position.x += (Math.random() - 0.5) * 0.75;
    window.setTimeout(() => {
      const activeEngine = engineRef.current;
      if (activeEngine) activeEngine.camera.position.x = 0;
    }, 90);

    updateHeartsState(nextLives);
  };

  const collectBonus = (type) => {
    const engine = engineRef.current;
    if (!engine) return;

    const isFlag = type === 'flag_item';
    const bonusScore = isFlag ? 500 : 300;
    engine.score += bonusScore;
    engine.bonusCount += 1;
    setBonusCount(engine.bonusCount);
    adjustTime(isFlag ? 4 : 2, isFlag ? '+4 detik Bendera Merah Putih!' : '+2 detik Kerupuk Emas!');
    if (soundEnabledRef.current) {
      playCoinSound();
    }
  };

  const createSideFlagMesh = () => {
    const flagGroup = new THREE.Group();

    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 4.5);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.25;
    flagGroup.add(pole);

    const redClothGeo = new THREE.PlaneGeometry(1.25, 0.46);
    const redClothMat = new THREE.MeshBasicMaterial({
      color: 0xdc2626,
      side: THREE.DoubleSide,
    });
    const redCloth = new THREE.Mesh(redClothGeo, redClothMat);
    redCloth.position.set(0.62, 4.02, 0);
    flagGroup.add(redCloth);

    const whiteClothGeo = new THREE.PlaneGeometry(1.25, 0.46);
    const whiteClothMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const whiteCloth = new THREE.Mesh(whiteClothGeo, whiteClothMat);
    whiteCloth.position.set(0.62, 3.56, 0);
    flagGroup.add(whiteCloth);

    return flagGroup;
  };

  const createTrack = (scene, trackSegments) => {
    const segmentLength = 80;
    for (let i = 0; i < 4; i += 1) {
      const trackGroup = new THREE.Group();
      trackGroup.position.z = -i * segmentLength;

      const trackGeo = new THREE.PlaneGeometry(16, segmentLength);
      const trackMat = new THREE.MeshStandardMaterial({
        color: 0xb91c1c,
        roughness: 0.74,
        metalness: 0.08,
      });
      const trackMesh = new THREE.Mesh(trackGeo, trackMat);
      trackMesh.rotation.x = -Math.PI / 2;
      trackMesh.receiveShadow = true;
      trackGroup.add(trackMesh);

      const lineGeo = new THREE.PlaneGeometry(0.15, segmentLength);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
      [-6.0, -3.0, 0, 3.0, 6.0].forEach((x) => {
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(x, 0.02, 0);
        trackGroup.add(line);
      });

      const grassGeo = new THREE.PlaneGeometry(40, segmentLength);
      const grassMat = new THREE.MeshStandardMaterial({
        color: 0x1f8a42,
        roughness: 0.9,
      });

      const grassLeft = new THREE.Mesh(grassGeo, grassMat);
      grassLeft.rotation.x = -Math.PI / 2;
      grassLeft.position.set(-26, -0.05, 0);
      trackGroup.add(grassLeft);

      const grassRight = grassLeft.clone();
      grassRight.position.set(26, -0.05, 0);
      trackGroup.add(grassRight);

      for (let zOffset = -30; zOffset <= 30; zOffset += 20) {
        const flagLeft = createSideFlagMesh();
        flagLeft.position.set(-7.5, 0, zOffset);
        trackGroup.add(flagLeft);

        const flagRight = createSideFlagMesh();
        flagRight.position.set(7.5, 0, zOffset);
        trackGroup.add(flagRight);
      }

      scene.add(trackGroup);
      trackSegments.push(trackGroup);
    }
  };

  const createStadiumStructures = (scene, floodlights) => {
    const standGeo = new THREE.BoxGeometry(18, 12, 200);
    const standMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.62 });
    const standLeft = new THREE.Mesh(standGeo, standMat);
    standLeft.position.set(20, 4, -80);
    standLeft.rotation.y = -0.05;
    standLeft.receiveShadow = true;
    scene.add(standLeft);

    const standRight = standLeft.clone();
    standRight.position.set(-20, 4, -80);
    standRight.rotation.y = 0.05;
    scene.add(standRight);

    const canopyGeo = new THREE.BoxGeometry(20, 2, 200);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const canopyLeft = new THREE.Mesh(canopyGeo, canopyMat);
    canopyLeft.position.set(21, 11, -80);
    scene.add(canopyLeft);

    const canopyRight = canopyLeft.clone();
    canopyRight.position.set(-21, 11, -80);
    scene.add(canopyRight);

    const poleGeo = new THREE.CylinderGeometry(0.4, 0.7, 30);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const lightGridGeo = new THREE.BoxGeometry(5, 7, 1);
    const lightGridMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffedd5,
      emissiveIntensity: 0.8,
    });

    [
      { x: 14, z: -30 },
      { x: 14, z: -110 },
      { x: -14, z: -60 },
      { x: -14, z: -140 },
    ].forEach((pos) => {
      const towerGroup = new THREE.Group();
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 15;
      pole.castShadow = true;
      towerGroup.add(pole);

      const grid = new THREE.Mesh(lightGridGeo, lightGridMat);
      grid.position.set(0, 29, 0);
      grid.rotation.y = pos.x > 0 ? -0.4 : 0.4;
      towerGroup.add(grid);

      towerGroup.position.set(pos.x, 0, pos.z);
      scene.add(towerGroup);
      floodlights.push(towerGroup);
    });
  };

  const createRunnerPlayer = (scene) => {
    const playerGroup = new THREE.Group();

    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.48 });
    const shortsMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.82 });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.25,
      emissive: 0xca8a04,
      emissiveIntensity: 0.28,
    });

    const torsoGeo = new THREE.BoxGeometry(0.8, 1.1, 0.45);
    const playerBody = new THREE.Mesh(torsoGeo, shirtMat);
    playerBody.position.y = 1.65;
    playerBody.castShadow = true;
    playerGroup.add(playerBody);

    const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 2.35, 0);
    head.castShadow = true;
    playerGroup.add(head);

    const headbandRed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    headbandRed.position.set(0, 2.46, 0);
    playerGroup.add(headbandRed);

    const headbandWhite = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.05, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    headbandWhite.position.set(0, 2.46, 0.24);
    playerGroup.add(headbandWhite);

    const shortsGeo = new THREE.BoxGeometry(0.82, 0.45, 0.48);
    const shorts = new THREE.Mesh(shortsGeo, shortsMat);
    shorts.position.set(0, 1.15, 0);
    playerGroup.add(shorts);

    const legGeo = new THREE.BoxGeometry(0.26, 0.9, 0.26);
    const shoeGeo = new THREE.BoxGeometry(0.28, 0.22, 0.55);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.24, 1.0, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, skinMat);
    leftLegMesh.position.y = -0.45;
    leftLegMesh.castShadow = true;
    leftLeg.add(leftLegMesh);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.85, 0.1);
    leftShoe.castShadow = true;
    leftLeg.add(leftShoe);
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.24, 1.0, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, skinMat);
    rightLegMesh.position.y = -0.45;
    rightLegMesh.castShadow = true;
    rightLeg.add(rightLegMesh);
    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.85, 0.1);
    rightShoe.castShadow = true;
    rightLeg.add(rightShoe);
    playerGroup.add(rightLeg);

    const armGeo = new THREE.BoxGeometry(0.2, 0.85, 0.2);
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.52, 2.0, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
    leftArmMesh.position.y = -0.4;
    leftArm.add(leftArmMesh);
    playerGroup.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.52, 2.0, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
    rightArmMesh.position.y = -0.4;
    rightArm.add(rightArmMesh);
    playerGroup.add(rightArm);

    playerGroup.position.set(LANES[1], 0, 0);
    scene.add(playerGroup);

    return { playerGroup, leftLeg, rightLeg, leftArm, rightArm };
  };

  const createObstacleMeshes = (scene, engine, x, z) => {
    const randType = Math.random();

    if (randType < 0.35) {
      const hurdleGroup = new THREE.Group();
      hurdleGroup.userData = { type: 'hurdle', radius: 1.1, height: 1.2 };

      const barMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
      const frameMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.8 });

      const bar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 0.1), barMat);
      bar.position.set(0, 1.0, 0);
      bar.castShadow = true;
      hurdleGroup.add(bar);

      const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.0);
      const legLeft = new THREE.Mesh(legGeo, frameMat);
      legLeft.position.set(-1.1, 0.5, 0);
      hurdleGroup.add(legLeft);
      const legRight = legLeft.clone();
      legRight.position.set(1.1, 0.5, 0);
      hurdleGroup.add(legRight);

      hurdleGroup.position.set(x, 0, z);
      scene.add(hurdleGroup);
      engine.obstacles.push(hurdleGroup);
      return;
    }

    if (randType < 0.6) {
      const bambuGroup = new THREE.Group();
      bambuGroup.userData = { type: 'bambu', radius: 1.0, height: 1.3 };
      const bambuGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.4, 8);
      const bambuMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });

      [-0.6, 0.6].forEach((offset) => {
        const bambu = new THREE.Mesh(bambuGeo, bambuMat);
        bambu.rotation.z = (Math.random() - 0.5) * 0.3;
        bambu.position.set(offset, 0.7, 0);
        bambu.castShadow = true;
        bambuGroup.add(bambu);
      });

      bambuGroup.position.set(x, 0, z);
      scene.add(bambuGroup);
      engine.obstacles.push(bambuGroup);
      return;
    }

    if (randType < 0.78) {
      const coneGroup = new THREE.Group();
      coneGroup.userData = { type: 'cone', radius: 1.0, height: 1.0 };
      const coneGeo = new THREE.ConeGeometry(0.45, 1.1, 12);
      const coneMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });

      [-0.6, 0.6].forEach((offset) => {
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.set(offset, 0.55, 0);
        cone.castShadow = true;
        coneGroup.add(cone);
      });

      coneGroup.position.set(x, 0, z);
      scene.add(coneGroup);
      engine.obstacles.push(coneGroup);
      return;
    }

    if (randType < 0.9) {
      const itemGroup = new THREE.Group();
      itemGroup.userData = { type: 'kerupuk', radius: 1.0 };
      const kerupuk = new THREE.Mesh(
        new THREE.TorusGeometry(0.45, 0.15, 12, 24),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0xca8a04,
          emissiveIntensity: 0.5,
        })
      );
      kerupuk.position.y = 1.3;
      kerupuk.castShadow = true;
      itemGroup.add(kerupuk);
      itemGroup.position.set(x, 0, z);
      scene.add(itemGroup);
      engine.collectibles.push(itemGroup);
      return;
    }

    const itemGroup = new THREE.Group();
    itemGroup.userData = { type: 'flag_item', radius: 1.0 };
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc })
    );
    pole.position.y = 1.2;
    itemGroup.add(pole);

    const red = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.22),
      new THREE.MeshBasicMaterial({ color: 0xdc2626, side: THREE.DoubleSide })
    );
    red.position.set(0.3, 1.6, 0);
    itemGroup.add(red);

    const white = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.22),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    white.position.set(0.3, 1.38, 0);
    itemGroup.add(white);

    itemGroup.position.set(x, 0, z);
    scene.add(itemGroup);
    engine.collectibles.push(itemGroup);
  };

  const spawnObstacleOrCollectible = () => {
    const engine = engineRef.current;
    if (!engine) return;

    const availableLanes = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    const numObjects = Math.random() < 0.65 ? 2 : 1;

    for (let i = 0; i < numObjects; i += 1) {
      const laneIdx = availableLanes[i];
      createObstacleMeshes(engine.scene, engine, LANES[laneIdx], -120);
    }
  };

  const moveLane = (delta) => {
    const engine = engineRef.current;
    if (!engine || phaseRef.current !== 'playing') return;

    const nextLane = Math.min(LANE_COUNT - 1, Math.max(0, engine.currentLane + delta));
    if (nextLane === engine.currentLane) return;

    unlockSound();
    if (soundEnabledRef.current) {
      playLaneSound();
    }

    engine.currentLane = nextLane;
    engine.playerTargetX = LANES[nextLane];
    setCurrentLane(nextLane);
  };

  const jump = () => {
    const engine = engineRef.current;
    if (!engine || phaseRef.current !== 'playing') return;
    if (engine.isJumping) return;

    unlockSound();
    if (soundEnabledRef.current) {
      playJumpSound();
    }

    engine.isJumping = true;
    engine.playerVY = JUMP_FORCE;
  };

  useEffect(() => {
    if (!containerRef.current || engineRef.current) return undefined;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x4a0f14);
    scene.fog = new THREE.FogExp2(0x7f1d1d, 0.0062);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      400
    );
    camera.position.set(0, 4.2, 8.5);
    camera.lookAt(0, 1.8, -15);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xfff1cf, 0.92));

    const sunLight = new THREE.DirectionalLight(0xfb923c, 1.85);
    sunLight.position.set(-30, 45, -40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.58);
    fillLight.position.set(30, 20, 20);
    scene.add(fillLight);

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(300, 32, 15),
      new THREE.MeshBasicMaterial({ color: 0x7c2d12, side: THREE.BackSide })
    );
    scene.add(sky);

    const trackSegments = [];
    const floodlights = [];
    createTrack(scene, trackSegments);
    createStadiumStructures(scene, floodlights);
    const limbs = createRunnerPlayer(scene);

    const clock = new THREE.Clock();

    engineRef.current = {
      scene,
      camera,
      renderer,
      clock,
      trackSegments,
      floodlights,
      playerGroup: limbs.playerGroup,
      leftLeg: limbs.leftLeg,
      rightLeg: limbs.rightLeg,
      leftArm: limbs.leftArm,
      rightArm: limbs.rightArm,
      obstacles: [],
      collectibles: [],
      currentLane: 1,
      playerTargetX: LANES[1],
      playerY: 0,
      playerVY: 0,
      isJumping: false,
      score: 0,
      distance: 0,
      lives: 3,
      gameSpeed: INITIAL_SPEED,
      animClock: 0,
      spawnTimer: 0,
      bonusCount: 0,
      hudTimer: 0,
      graceTime: START_GRACE_SECONDS,
    };

    const handleResize = () => {
      const activeEngine = engineRef.current;
      if (!activeEngine || !containerRef.current) return;
      activeEngine.camera.aspect =
        containerRef.current.clientWidth / Math.max(containerRef.current.clientHeight, 1);
      activeEngine.camera.updateProjectionMatrix();
      activeEngine.renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };

    window.addEventListener('resize', handleResize);
    resizeCleanupRef.current = () => window.removeEventListener('resize', handleResize);

    const animate = () => {
      animationFrameRef.current = window.requestAnimationFrame(animate);
      const engine = engineRef.current;
      if (!engine) return;

      const delta = engine.clock.getDelta();
      if (phaseRef.current === 'playing') {
        engine.animClock += delta * (engine.gameSpeed / 14);

        engine.playerGroup.position.x +=
          (engine.playerTargetX - engine.playerGroup.position.x) * 0.22;

        if (engine.isJumping) {
          engine.playerY += engine.playerVY * delta;
          engine.playerVY += JUMP_GRAVITY * delta;
          if (engine.playerY <= 0) {
            engine.playerY = 0;
            engine.isJumping = false;
            engine.playerVY = 0;
          }
        }

        engine.playerGroup.position.y = engine.playerY;

        if (!engine.isJumping) {
          const swingAngle = Math.sin(engine.animClock * 13) * 0.75;
          engine.leftLeg.rotation.x = swingAngle;
          engine.rightLeg.rotation.x = -swingAngle;
          engine.leftArm.rotation.x = -swingAngle * 0.8;
          engine.rightArm.rotation.x = swingAngle * 0.8;
        } else {
          engine.leftLeg.rotation.x = -0.6;
          engine.rightLeg.rotation.x = 0.6;
          engine.leftArm.rotation.x = 0.8;
          engine.rightArm.rotation.x = -0.8;
        }

        const moveDist = engine.gameSpeed * delta;
        const multiplier = getScoreMultiplier(engine.distance);
        engine.graceTime = Math.max(0, engine.graceTime - delta);
        engine.distance += moveDist * 0.4;
        engine.score += moveDist * 0.8 * multiplier;

        if (engine.gameSpeed < MAX_SPEED) {
          engine.gameSpeed += delta * 0.45;
        }

        engine.trackSegments.forEach((segment) => {
          segment.position.z += moveDist;
          if (segment.position.z >= 80) {
            segment.position.z -= 320;
          }
        });

        engine.floodlights.forEach((tower) => {
          tower.position.z += moveDist;
          if (tower.position.z > 30) {
            tower.position.z -= 240;
          }
        });

        engine.spawnTimer += delta * (engine.gameSpeed / 20);
        if (engine.graceTime <= 0 && engine.spawnTimer > 1.7) {
          engine.spawnTimer = 0;
          spawnObstacleOrCollectible();
        }

        for (let i = engine.obstacles.length - 1; i >= 0; i -= 1) {
          const obs = engine.obstacles[i];
          obs.position.z += moveDist;

          const dz = Math.abs(obs.position.z - engine.playerGroup.position.z);
          const dx = Math.abs(obs.position.x - engine.playerGroup.position.x);

          if (engine.graceTime <= 0 && dz < 0.9 && dx < 1.1) {
            const hitHeight = obs.userData.height || 1.0;
            if (engine.playerY < hitHeight) {
              handleCollision();
              engine.scene.remove(obs);
              engine.obstacles.splice(i, 1);
              continue;
            }
          }

          if (obs.position.z > 15) {
            engine.scene.remove(obs);
            engine.obstacles.splice(i, 1);
          }
        }

        for (let i = engine.collectibles.length - 1; i >= 0; i -= 1) {
          const item = engine.collectibles[i];
          item.position.z += moveDist;
          item.rotation.y += delta * 4;

          const dz = Math.abs(item.position.z - engine.playerGroup.position.z);
          const dx = Math.abs(item.position.x - engine.playerGroup.position.x);

          if (engine.graceTime <= 0 && dz < 1.0 && dx < 1.0 && engine.playerY < 2.2) {
            collectBonus(item.userData.type);
            engine.scene.remove(item);
            engine.collectibles.splice(i, 1);
            continue;
          }

          if (item.position.z > 15) {
            engine.scene.remove(item);
            engine.collectibles.splice(i, 1);
          }
        }

        engine.hudTimer += delta;
        if (engine.hudTimer > 0.1) {
          engine.hudTimer = 0;
          syncHud();
        }
      }

      engine.renderer.render(engine.scene, engine.camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
      resizeCleanupRef.current?.();
      window.clearInterval(gameTimerRef.current);
      window.clearTimeout(countdownTimerRef.current);
      window.clearTimeout(toastTimerRef.current);

      if (engineRef.current) {
        const activeEngine = engineRef.current;
        activeEngine.renderer.dispose();
        if (container.contains(activeEngine.renderer.domElement)) {
          container.removeChild(activeEngine.renderer.domElement);
        }
      }
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (phaseRef.current !== 'playing') return;

      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        event.preventDefault();
        moveLane(-1);
      }
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        event.preventDefault();
        moveLane(1);
      }
      if (
        event.key === 'ArrowUp' ||
        event.key === ' ' ||
        event.key === 'w' ||
        event.key === 'W'
      ) {
        event.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleTouchStart = (event) => {
      if (phaseRef.current !== 'playing') return;
      controlsRef.current.startX = event.touches[0].clientX;
      controlsRef.current.startY = event.touches[0].clientY;
    };

    const handleTouchEnd = (event) => {
      if (phaseRef.current !== 'playing') return;
      const diffX = event.changedTouches[0].clientX - controlsRef.current.startX;
      const diffY = event.changedTouches[0].clientY - controlsRef.current.startY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < -30) moveLane(-1);
        else if (diffX > 30) moveLane(1);
      } else if (diffY < -30) {
        jump();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'countdown') return undefined;

    if (countdown === 0) {
      if (soundEnabledRef.current) {
        playCountdownSound(0);
      }
      phaseRef.current = 'playing';
      setPhase('playing');
      setTimeLeft(TOTAL_TIME);
      gameTimerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            window.clearInterval(gameTimerRef.current);
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return undefined;
    }

    if (soundEnabledRef.current) {
      playCountdownSound(countdown);
    }
    countdownTimerRef.current = window.setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(countdownTimerRef.current);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'finished' || submittedRef.current) return;

    submittedRef.current = true;
    setSubmitState('submitting');

    submitScore({
      gameKey: 'lari',
      playerName,
      region,
      score: Math.round(score),
      detailLabel: 'Jarak • multiplier • bonus',
      detailValue: `${distance} m • x${getScoreMultiplier(distance)} • ${bonusCount} item`,
      verdict: getVerdict(score),
    })
      .then((result) => {
        if (result?.skipped) {
          setSubmitState('missing-config');
          return;
        }
        setSubmitState('saved');
      })
      .catch(() => setSubmitState('error'));
  }, [phase, playerName, region, score, distance, bonusCount]);

  const resetGame = () => {
    const engine = engineRef.current;
    if (!engine) return;

    window.clearInterval(gameTimerRef.current);
    window.clearTimeout(countdownTimerRef.current);
    window.clearTimeout(toastTimerRef.current);

    engine.score = 0;
    engine.distance = 0;
    engine.lives = 3;
    engine.gameSpeed = INITIAL_SPEED;
    engine.currentLane = 1;
    engine.spawnTimer = 0;
    engine.animClock = 0;
    engine.bonusCount = 0;
    engine.hudTimer = 0;
    engine.graceTime = START_GRACE_SECONDS;
    resetRunnerPose(engine);
    engine.clock.start();

    engine.obstacles.forEach((item) => engine.scene.remove(item));
    engine.collectibles.forEach((item) => engine.scene.remove(item));
    engine.obstacles = [];
    engine.collectibles = [];
    collisionLockRef.current = false;

    phaseRef.current = 'countdown';
    submittedRef.current = false;
    setPhase('countdown');
    setCountdown(3);
    setScore(0);
    setDistance(0);
    setLives(3);
    setSpeedKmh(INITIAL_SPEED);
    setTimeLeft(TOTAL_TIME);
    setCurrentLane(1);
    setToast('');
    setBonusCount(0);
    setSubmitState('idle');
    syncHud();
  };

  const handleShare = async () => {
    setIsSharing(true);
    await shareOrDownloadCertificate('certificate-lari', playerName, Math.round(score));
    setIsSharing(false);
  };

  const toggleSound = async () => {
    await unlockSound();
    setSoundEnabled((prev) => !prev);
  };

  const multiplier = useMemo(() => getScoreMultiplier(distance), [distance]);
  const hearts = useMemo(() => Array.from({ length: 3 }, (_, i) => i < lives), [lives]);

  return (
    <main className="flex flex-1 flex-col px-4 pb-4">
      {phase !== 'finished' && (
        <section className="flex flex-1 flex-col">
          <div className="grid grid-cols-4 gap-2">
            <div className="festival-stat-card">
              <span>Skor</span>
              <strong>{Math.round(score)}</strong>
            </div>
            <div className="festival-stat-card">
              <span>Jarak</span>
              <strong>{distance}m</strong>
            </div>
            <div className="festival-stat-card">
              <span>Lari</span>
              <strong>{speedKmh}</strong>
            </div>
            <div className="festival-stat-card">
              <span>Waktu</span>
              <strong>{timeLeft}s</strong>
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-[30px] border border-white/14 bg-black/28 shadow-[0_22px_44px_rgba(0,0,0,0.28)]">
            <div className="relative h-[520px] w-full">
              <div ref={containerRef} className="absolute inset-0"></div>
              <div className="pointer-events-none absolute inset-0 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-[22px] border border-red-300/38 bg-slate-950/84 px-3 py-2 text-white shadow-[0_10px_28px_rgba(0,0,0,0.24)] backdrop-blur-md">
                    <p className="festival-eyebrow mb-1">Arena 01 • Lari Kemerdekaan</p>
                    <p className="text-sm font-semibold text-white/90">
                      4 lintasan • x{multiplier} multiplier • bonus {bonusCount}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-[22px] border border-white/14 bg-slate-950/84 px-3 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.24)] backdrop-blur-md">
                      <div className="flex items-center gap-1.5 text-rose-400">
                        {hearts.map((active, index) => (
                          <Heart
                            key={index}
                            className={`h-4 w-4 ${active ? 'fill-current opacity-100' : 'opacity-25'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleSound}
                      className="pointer-events-auto rounded-[22px] border border-white/14 bg-slate-950/84 px-3 py-3 text-white shadow-[0_10px_28px_rgba(0,0,0,0.24)] backdrop-blur-md"
                    >
                      {soundEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-rose-300" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-x-0 top-[74px] flex justify-center">
                  {toast ? (
                    <div className="rounded-full border border-amber-300/38 bg-slate-950/90 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-100 shadow-[0_10px_26px_rgba(0,0,0,0.24)] backdrop-blur-md">
                      {toast}
                    </div>
                  ) : null}
                </div>

                {phase === 'countdown' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/56 text-center backdrop-blur-[2px]">
                    <p className="festival-eyebrow mb-3">Stadion Merah-Putih</p>
                    <div className="font-game text-[104px] font-black leading-none text-yellow-300">
                      {countdown}
                    </div>
                    <p className="mt-4 max-w-[280px] text-sm leading-6 text-white/88">
                      Swipe kiri-kanan untuk pindah lintasan, swipe atas untuk melompat,
                      atau pakai tombol bawah dan keyboard.
                    </p>
                  </div>
                )}

                <div className="pointer-events-auto absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2 md:hidden">
                  <button type="button" onPointerDown={() => moveLane(-1)} className="festival-action-pad">
                    <ChevronLeft className="h-5 w-5" />
                    Kiri
                  </button>
                  <button type="button" onPointerDown={jump} className="festival-primary-button !mt-0">
                    Lompat
                  </button>
                  <button type="button" onPointerDown={() => moveLane(1)} className="festival-action-pad">
                    Kanan
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-[22px] border border-white/12 bg-black/24 px-3 py-2 text-[12px] text-white/82">
            Keyboard: `← → ↑`, `A D W`, atau `Space`.
          </div>
        </section>
      )}

      {phase === 'finished' && (
        <section className="flex flex-1 flex-col items-center text-center">
          <div className="mb-4">
            <CertificateStory
              id="certificate-lari"
              name={playerName}
              region={region}
              gameName="Arena 01 • Lari Kemerdekaan"
              headline="Lari Kemerdekaan 3D"
              scoreLabel="Skor akhir"
              scoreValue={Math.round(score)}
              scoreUnit="poin"
              detailLabel="Jarak • multiplier • bonus"
              detailValue={`${distance} m • x${multiplier} • ${bonusCount} item`}
              verdict={getVerdict(score)}
            />
          </div>

          <div className="grid w-full gap-2">
            <button type="button" onClick={handleShare} disabled={isSharing} className="festival-primary-button">
              <Share2 className="h-5 w-5" />
              {isSharing ? 'Memproses poster...' : 'Bagikan hasil arena'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={resetGame} className="festival-secondary-button">
                <RotateCcw className="h-4 w-4" />
                Main lagi
              </button>
              <button type="button" onClick={onExit} className="festival-ghost-button h-full justify-center">
                Pilih arena lain
              </button>
            </div>

            <p className="text-center text-[12px] text-white/62">
              {submitState === 'submitting' && 'Menyimpan skor ke leaderboard global...'}
              {submitState === 'saved' && 'Skor berhasil tersimpan ke leaderboard global.'}
              {submitState === 'missing-config' && 'Leaderboard global belum aktif di environment ini.'}
              {submitState === 'error' && 'Skor gagal tersimpan. Cek koneksi atau konfigurasi database.'}
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
