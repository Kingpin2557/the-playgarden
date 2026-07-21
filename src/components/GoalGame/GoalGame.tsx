import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useMap, vector3ToCoords } from "react-three-map/maplibre";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import { Physics, type RapierRigidBody } from "@react-three/rapier";
import type { Mesh } from "three";

import { useGameStore } from "../../store/gameStore";
import { BALL_GAME, COORDS } from "../../constants";
import { splitGoals, computeGoalLayout, toWorld, type Split } from "../../lib/goalPhysics";
import { useAimAndShoot } from "../../hooks/useAimAndShoot";
import GoalPitch from "../GoalPitch/GoalPitch";
import GoalPosts from "../GoalPosts/GoalPosts";
import GoalBall from "../GoalBall/GoalBall";

// center is the goals' position in scene metres (world XZ); rotation matches the
// placed model. The pitch is built inside one rotated body, so the two goals sit
// along the model's long (local X) axis just like what you see.
interface GoalGameProps {
  center: { x: number; z: number };
  url: string;
  rotation: number;
}

function GoalGame({ center, url, rotation }: GoalGameProps) {
  const map = useMap();
  const { scene } = useGLTF(url);
  const scoreLeft = useGameStore((state) => state.scoreLeft);
  const scoreRight = useGameStore((state) => state.scoreRight);
  const resetGame = useGameStore((state) => state.resetGame);
  const setAiming = useGameStore((state) => state.setAiming);
  const resetToken = useGameStore((state) => state.resetToken);
  const goalPlacement = useGameStore((state) => state.goalPlacement);
  const playing = useGameStore((state) => state.playing);
  const startGame = useGameStore((state) => state.startGame);
  const stopGame = useGameStore((state) => state.stopGame);
  const setPlayBounds = useGameStore((state) => state.setPlayBounds);

  const ballRef = useRef<RapierRigidBody>(null!);
  const ballMeshRef = useRef<Mesh>(null!);

  // Build the two goal colliders + measurements from the model, once.
  const [goals, setGoals] = useState<Split | null>(null);
  useEffect(() => {
    setGoals(splitGoals(scene));
  }, [scene]);

  // Fresh scoreboard when you enter; stop the game when you leave the PoI.
  useEffect(() => {
    resetGame();
    return () => stopGame();
  }, [resetGame, stopGame]);

  const {
    ballRadius,
    kick,
    margin,
    boxCenter,
    showCenter,
    showGoals,
    ballStart,
    goalsOffset,
    goalsRotate,
    debug,
  } = useControls("Ball Game", {
    ballRadius: { value: BALL_GAME.ballRadius, min: 0.1, max: 1.5, step: 0.05 },
    kick: { value: BALL_GAME.kick, min: 0.5, max: 8, step: 0.5, label: "kick power" },
    margin: { value: BALL_GAME.margin, min: 1, max: 2, step: 0.05, label: "wall margin" },
    boxCenter: { value: BALL_GAME.boxCenter, step: 0.5, label: "box center" },
    showCenter: { value: BALL_GAME.showCenter, label: "show center" },
    showGoals: { value: BALL_GAME.showGoals, label: "show goal walls" },
    ballStart: { value: BALL_GAME.ballStart, step: 0.5, label: "ball start" },
    goalsOffset: { value: BALL_GAME.goalsOffset, step: 0.25, label: "goals move" },
    goalsRotate: { value: BALL_GAME.goalsRotate, min: -180, max: 180, step: 1, label: "goals rotate" },
    debug: { value: BALL_GAME.debug, label: "show colliders" },
  });

  // Where everything (walls, goals, ball start) sits in world space, based on
  // the visible goal model's live placement. pitch/posts/ball are pre-shaped
  // to spread straight onto the matching child; the rest is what GoalGame
  // itself computes with below.
  const {
    pitch,
    posts,
    ball,
    halfX,
    halfZ,
    boxWX,
    boxWZ,
    spawnY,
    startWX,
    startWZ,
    maxPull,
  } = computeGoalLayout({
    center,
    rotation,
    goalPlacement,
    goals,
    ballRadius,
    margin,
    boxCenter,
    ballStart,
    goalsOffset,
    goalsRotate,
  });

  const { aim, onBallDown, moveDrag, endDrag, registerGoal, setCursor } =
    useAimAndShoot({
      map,
      ballRef,
      ballMeshRef,
      playing,
      startGame,
      setAiming,
      spawnY,
      kick,
      maxPull,
    });

  // Publish the play-box footprint (the walls) as a lng/lat rectangle so the map
  // can fence panning to it while the game runs.
  useEffect(() => {
    const corners: [number, number][] = [
      [halfX, halfZ],
      [halfX, -halfZ],
      [-halfX, halfZ],
      [-halfX, -halfZ],
    ];
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;
    for (const [lx, lz] of corners) {
      const [wx, wz] = toWorld(boxWX, boxWZ, pitch.spinY, lx, lz);
      const { longitude, latitude } = vector3ToCoords([wx, 0, wz], COORDS);
      minLng = Math.min(minLng, longitude);
      maxLng = Math.max(maxLng, longitude);
      minLat = Math.min(minLat, latitude);
      maxLat = Math.max(maxLat, latitude);
    }
    setPlayBounds([
      [minLng, minLat],
      [maxLng, maxLat],
    ]);
    return () => setPlayBounds(null);
  }, [boxWX, boxWZ, halfX, halfZ, pitch.spinY, setPlayBounds]);

  // The map only renders on demand, so keep it ticking while we play.
  useFrame(() => map.triggerRepaint());

  // Put the ball back on its start spot whenever resetToken changes.
  useEffect(() => {
    const ballBody = ballRef.current;
    if (!ballBody) return;
    ballBody.setTranslation({ x: startWX, y: spawnY, z: startWZ }, true);
    ballBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    ballBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }, [resetToken, startWX, startWZ, spawnY]);

  return (
    <Physics gravity={[0, -9.81, 0]} debug={debug}>
      <GoalPitch {...pitch} showCenter={showCenter} onDrag={moveDrag} onDragEnd={endDrag} />

      {goals && (
        <GoalPosts
          goals={goals}
          {...posts}
          showDebug={showGoals}
          onLeftCollision={(payload) => registerGoal(payload, scoreLeft)}
          onRightCollision={(payload) => registerGoal(payload, scoreRight)}
        />
      )}

      <GoalBall
        ballRef={ballRef}
        ballMeshRef={ballMeshRef}
        radius={ballRadius}
        {...ball}
        aim={aim}
        onBallDown={onBallDown}
        onDrag={moveDrag}
        onDragEnd={endDrag}
        setCursor={setCursor}
      />
    </Physics>
  );
}

export default GoalGame;
