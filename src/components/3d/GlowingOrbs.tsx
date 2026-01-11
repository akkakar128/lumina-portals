import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Trail, Float } from '@react-three/drei';
import * as THREE from 'three';

interface OrbProps {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
  distort?: number;
  emissiveIntensity?: number;
}

const GlowingOrb = ({ 
  position, 
  color, 
  scale = 1, 
  speed = 1, 
  distort = 0.4,
  emissiveIntensity = 2
}: OrbProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time * speed) * 0.5;
      meshRef.current.position.x = position[0] + Math.cos(time * speed * 0.5) * 0.3;
    }
  });

  return (
    <Float speed={speed * 2} rotationIntensity={0.3} floatIntensity={0.8}>
      <Trail
        width={3}
        length={5}
        color={color}
        attenuation={(t) => t * t}
      >
        <mesh ref={meshRef} position={position} scale={scale}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            distort={distort}
            speed={3}
            roughness={0}
            metalness={0.5}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Trail>
    </Float>
  );
};

const EnergyRing = ({ radius = 5, color = '#00ffff', tubeRadius = 0.05 }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 0, -8]}>
      <torusGeometry args={[radius, tubeRadius, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
};

const GlowingOrbs = () => {
  const orbs = useMemo(() => [
    { position: [-6, 3, -8] as [number, number, number], color: '#00ffff', scale: 0.8, speed: 0.6 },
    { position: [7, -2, -6] as [number, number, number], color: '#a855f7', scale: 0.6, speed: 0.8 },
    { position: [0, 4, -12] as [number, number, number], color: '#ec4899', scale: 1.2, speed: 0.4 },
    { position: [-5, -4, -5] as [number, number, number], color: '#22c55e', scale: 0.5, speed: 1.0 },
    { position: [6, 4, -10] as [number, number, number], color: '#f59e0b', scale: 0.7, speed: 0.5 },
  ], []);

  return (
    <group>
      {orbs.map((orb, index) => (
        <GlowingOrb key={index} {...orb} />
      ))}
      <EnergyRing radius={8} color="#00ffff" tubeRadius={0.02} />
      <EnergyRing radius={12} color="#a855f7" tubeRadius={0.015} />
    </group>
  );
};

export default GlowingOrbs;
