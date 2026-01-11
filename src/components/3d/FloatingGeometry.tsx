import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import InteractiveParticles from './InteractiveParticles';
import GlowingOrbs from './GlowingOrbs';
import NeuralNetwork from './NeuralNetwork';

interface FloatingShapeProps {
  position: [number, number, number];
  scale?: number;
  color: string;
  speed?: number;
  distort?: number;
  geometry?: 'icosahedron' | 'octahedron' | 'dodecahedron' | 'torus';
}

const FloatingShape = ({ 
  position, 
  scale = 1, 
  color, 
  speed = 1, 
  distort = 0.3,
  geometry = 'icosahedron'
}: FloatingShapeProps) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
      
      // Pulse effect on hover
      const targetScale = hovered ? scale * 1.2 : scale;
      meshRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const renderGeometry = () => {
    switch (geometry) {
      case 'octahedron':
        return <octahedronGeometry args={[1, 0]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[1, 0]} />;
      case 'torus':
        return <torusGeometry args={[1, 0.4, 16, 32]} />;
      default:
        return <icosahedronGeometry args={[1, 1]} />;
    }
  };

  return (
    <Float speed={speed * 2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh 
        ref={meshRef} 
        position={position} 
        scale={scale}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {renderGeometry()}
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
};

// Animated grid floor
const GridFloor = () => {
  const gridRef = useRef<any>(null);
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 2;
    }
  });

  return (
    <group ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, -10]}>
      <gridHelper args={[50, 50, '#00ffff', '#0a0a1f']} />
    </group>
  );
};

const FloatingGeometry = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { camera } = useThree();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    // Subtle camera movement following mouse
    camera.position.x += (mousePos.x * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (mousePos.y * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, -5);
  });

  return (
    <>
      {/* Main geometric shapes with variety */}
      <FloatingShape position={[-4, 2, -5]} scale={1.5} color="#00ffff" speed={0.5} distort={0.4} geometry="icosahedron" />
      <FloatingShape position={[4, -1, -3]} scale={1} color="#a855f7" speed={0.7} distort={0.3} geometry="octahedron" />
      <FloatingShape position={[0, 3, -8]} scale={2} color="#ec4899" speed={0.3} distort={0.5} geometry="dodecahedron" />
      <FloatingShape position={[-3, -3, -4]} scale={0.8} color="#22c55e" speed={0.9} distort={0.2} geometry="icosahedron" />
      <FloatingShape position={[5, 2, -6]} scale={1.2} color="#f59e0b" speed={0.4} distort={0.35} geometry="torus" />
      <FloatingShape position={[-6, 0, -7]} scale={0.6} color="#06b6d4" speed={0.6} distort={0.25} geometry="octahedron" />
      
      {/* Interactive particle systems */}
      <InteractiveParticles count={1500} color="#00ffff" size={0.02} spread={20} />
      <InteractiveParticles count={800} color="#a855f7" size={0.015} spread={25} />
      
      {/* Glowing orbs with trails */}
      <GlowingOrbs />
      
      {/* Neural network visualization */}
      <NeuralNetwork nodeCount={25} spread={18} />
      
      {/* Animated grid floor */}
      <GridFloor />
      
      {/* Enhanced lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} color="#00ffff" />
      <directionalLight position={[-5, -5, 5]} intensity={0.3} color="#a855f7" />
      <pointLight position={[0, 0, 5]} intensity={1.5} color="#00ffff" distance={25} decay={2} />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color="#ec4899" distance={20} decay={2} />
      <pointLight position={[5, -3, -8]} intensity={0.6} color="#a855f7" distance={20} decay={2} />
      
      {/* Spotlight for dramatic effect */}
      <spotLight
        position={[0, 10, 5]}
        angle={0.3}
        penumbra={0.8}
        intensity={0.5}
        color="#ffffff"
        castShadow
      />
    </>
  );
};

export default FloatingGeometry;
