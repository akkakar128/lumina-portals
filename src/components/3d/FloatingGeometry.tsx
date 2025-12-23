import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Float, MeshDistortMaterial } from '@react-three/drei';

interface FloatingShapeProps {
  position: [number, number, number];
  scale?: number;
  color: string;
  speed?: number;
  distort?: number;
}

const FloatingShape = ({ position, scale = 1, color, speed = 1, distort = 0.3 }: FloatingShapeProps) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });

  return (
    <Float speed={speed * 2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
};

const Particles = ({ count = 100 }: { count?: number }) => {
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      p.push(new Vector3(x, y, z));
    }
    return p;
  }, [count]);

  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <group ref={meshRef}>
      {points.map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.02 + Math.random() * 0.03, 8, 8]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.6 + Math.random() * 0.4} />
        </mesh>
      ))}
    </group>
  );
};

const FloatingGeometry = () => {
  return (
    <>
      {/* Main shapes */}
      <FloatingShape position={[-4, 2, -5]} scale={1.5} color="#00ffff" speed={0.5} distort={0.4} />
      <FloatingShape position={[4, -1, -3]} scale={1} color="#a855f7" speed={0.7} distort={0.3} />
      <FloatingShape position={[0, 3, -8]} scale={2} color="#ec4899" speed={0.3} distort={0.5} />
      <FloatingShape position={[-3, -3, -4]} scale={0.8} color="#00ffff" speed={0.9} distort={0.2} />
      <FloatingShape position={[5, 2, -6]} scale={1.2} color="#a855f7" speed={0.4} distort={0.35} />
      
      {/* Particle field */}
      <Particles count={150} />
      
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#00ffff" />
      <directionalLight position={[-5, -5, 5]} intensity={0.3} color="#a855f7" />
      <pointLight position={[0, 0, 5]} intensity={1} color="#00ffff" distance={20} />
    </>
  );
};

export default FloatingGeometry;
