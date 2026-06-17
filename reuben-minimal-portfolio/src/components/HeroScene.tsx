import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Preload, Sparkles } from "@react-three/drei";
import {
  AdditiveBlending,
  Group,
  MathUtils,
  MeshStandardMaterial,
  Vector3,
} from "three";

const SATELLITES = [
  { position: [-4.9, 1.8, -0.5], color: "#74f3ef" },
  { position: [4.8, 1.55, -0.35], color: "#ffd28b" },
  { position: [-3.9, -1.95, 0.25], color: "#96b6ff" },
  { position: [3.95, -1.75, 0.3], color: "#5dd9ff" },
  { position: [0.15, 2.65, -0.6], color: "#b4fff3" },
];

const CONNECTIONS = SATELLITES.map(({ position }) => [new Vector3(0, 0, -0.15), new Vector3(...position)] as const);

function createParticleField() {
  const points: number[] = [];
  let seed = 42;

  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 140; i += 1) {
    const radius = 4.2 + next() * 7.4;
    const theta = next() * Math.PI * 2;
    const height = (next() - 0.5) * 4.8;
    points.push(Math.cos(theta) * radius, height, Math.sin(theta) * radius * 0.28 - 2.8);
  }

  return new Float32Array(points);
}

function DistantVisionStage() {
  const groupRef = useRef<Group | null>(null);
  const glowRef = useRef<MeshStandardMaterial | null>(null);
  const particleRef = useRef<Group | null>(null);

  const particlePositions = useMemo(() => createParticleField(), []);

  useFrame((state, delta) => {
    const { pointer, clock } = state;
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.x = MathUtils.damp(groupRef.current.rotation.x, pointer.y * 0.12, 4, delta);
      groupRef.current.rotation.y = MathUtils.damp(groupRef.current.rotation.y, pointer.x * 0.22, 4, delta);
      groupRef.current.position.y = Math.sin(t * 0.45) * 0.12;
    }

    if (glowRef.current) {
      glowRef.current.opacity = 0.12 + Math.sin(t * 0.9) * 0.025;
      glowRef.current.emissiveIntensity = 0.5 + Math.sin(t * 0.85) * 0.08;
    }

    if (particleRef.current) {
      particleRef.current.rotation.z += delta * 0.01;
      particleRef.current.rotation.y -= delta * 0.015;
    }
  });

  return (
    <>
      <fog attach="fog" args={["#05100e", 9, 24]} />
      <ambientLight intensity={1.15} color="#dffff7" />
      <directionalLight position={[0, 4, 6]} intensity={2.2} color="#d8fbff" />
      <pointLight position={[0, 1.8, 3.5]} intensity={16} distance={17} color="#72ecff" />
      <pointLight position={[3.6, -1.5, 2.2]} intensity={12} distance={16} color="#ffc97a" />

      <group ref={groupRef} position={[0, 0, 0]}>
        <mesh position={[0, -1.7, -2.6]} rotation={[-Math.PI / 2.5, 0, 0]}>
          <circleGeometry args={[6.8, 96]} />
          <meshBasicMaterial color="#8bf8f4" transparent opacity={0.06} />
        </mesh>

        <mesh position={[0, -1.7, -2.8]} rotation={[-Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[2.75, 2.82, 128]} />
          <meshBasicMaterial color="#9ae9ff" transparent opacity={0.16} />
        </mesh>

        <mesh position={[0, -1.7, -2.82]} rotation={[-Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[4.45, 4.48, 160]} />
          <meshBasicMaterial color="#f3c57a" transparent opacity={0.09} />
        </mesh>

        <group ref={particleRef}>
          <points position={[0, 0, -1.8]}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[particlePositions, 3]}
                count={particlePositions.length / 3}
              />
            </bufferGeometry>
            <pointsMaterial
              color="#b4fff5"
              size={0.045}
              transparent
              opacity={0.7}
              depthWrite={false}
              blending={AdditiveBlending}
            />
          </points>
        </group>

        <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.24}>
          <mesh position={[0, -0.2, -0.55]}>
            <torusGeometry args={[2.85, 0.025, 24, 180]} />
            <meshBasicMaterial color="#91f4ff" transparent opacity={0.34} />
          </mesh>
        </Float>

        <Float speed={0.9} rotationIntensity={0.04} floatIntensity={0.18}>
          <mesh position={[0, -0.35, -1.15]} rotation={[0.4, 0, 0]}>
            <ringGeometry args={[1.8, 1.95, 120]} />
            <meshStandardMaterial
              ref={glowRef}
              color="#71edf6"
              emissive="#76efff"
              emissiveIntensity={0.48}
              transparent
              opacity={0.16}
            />
          </mesh>
        </Float>

        {CONNECTIONS.map((points, index) => (
          <Line
            key={`connector-${index}`}
            points={points}
            color={index % 2 === 0 ? "#7beef5" : "#f3c57a"}
            transparent
            opacity={0.28}
            lineWidth={1}
          />
        ))}

        {SATELLITES.map(({ position, color }, index) => (
          <group key={`satellite-${index}`} position={position as [number, number, number]}>
            <mesh>
              <sphereGeometry args={[0.13, 32, 32]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.18} />
            </mesh>
            <mesh scale={1.65}>
              <ringGeometry args={[0.16, 0.18, 42]} />
              <meshBasicMaterial color={color} transparent opacity={0.44} />
            </mesh>
          </group>
        ))}

        <Sparkles
          count={42}
          scale={[11, 5, 6]}
          position={[0, 0.2, -1.4]}
          size={2.2}
          speed={0.28}
          color="#fff4ce"
        />
      </group>
    </>
  );
}

export function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.25]}
      camera={{ position: [0, 0.15, 8.6], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <DistantVisionStage />
      <Preload all />
    </Canvas>
  );
}
