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
      // Slower, smoother rotation with eased sine waves
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.x += Math.sin(time * 0.3 * speed) * 0.002;
      meshRef.current.rotation.y += Math.cos(time * 0.2 * speed) * 0.002;
      
      // Smoother scale transition with gentler lerp factor
      const targetScale = hovered ? scale * 1.15 : scale;
      meshRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.03);
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
    <Float speed={speed * 0.8} rotationIntensity={0.2} floatIntensity={0.4}>
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
          emissiveIntensity={hovered ? 0.4 : 0.15}
          distort={distort * 0.5}
          speed={0.8}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={0.9}
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
      // Slower, smoother grid movement
      gridRef.current.position.z = (state.clock.elapsedTime * 0.15) % 2;
    }
  });

  return (
    <group ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, -10]}>
      <gridHelper args={[50, 50, '#00ffff', '#0a0a1f']} />
    </group>
  );
};

interface FloatingGeometryProps {
  isMobile?: boolean;
}

const FloatingGeometry = ({ isMobile = false }: FloatingGeometryProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { camera } = useThree();

  useEffect(() => {
    // Disable mouse tracking on mobile for performance
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  useFrame(() => {
    if (isMobile) return;
    
    // Smoother camera following with gentler lerp
    camera.position.x += (mousePos.x * 0.3 - camera.position.x) * 0.008;
    camera.position.y += (mousePos.y * 0.2 - camera.position.y) * 0.008;
    camera.lookAt(0, 0, -5);
  });

  // Responsive scale multiplier - slightly reduced for mobile but still visible
  const scale = isMobile ? 0.8 : 1;
  const spread = isMobile ? 0.85 : 1;
  
  // Fixed particle counts based on device (determined at mount, stable for component lifecycle)
  const particleCount = isMobile ? 600 : 1500;
  const secondaryParticleCount = isMobile ? 300 : 800;

  return (
    <>
      {/* Main geometric shapes - all visible, just scaled on mobile */}
      <FloatingShape position={[-3.5 * spread, 1.5 * spread, -5]} scale={1.4 * scale} color="#00ffff" speed={0.5} distort={0.4} geometry="icosahedron" />
      <FloatingShape position={[3.5 * spread, -1 * spread, -3]} scale={1 * scale} color="#a855f7" speed={0.7} distort={0.3} geometry="octahedron" />
      <FloatingShape position={[0, 2.5 * spread, -7]} scale={1.8 * scale} color="#ec4899" speed={0.3} distort={0.5} geometry="dodecahedron" />
      <FloatingShape position={[-2.5 * spread, -2.5 * spread, -4]} scale={0.7 * scale} color="#22c55e" speed={0.9} distort={0.2} geometry="icosahedron" />
      
      {/* Additional shapes only on desktop */}
      {!isMobile && (
        <>
          <FloatingShape position={[5, 2, -6]} scale={1.2} color="#f59e0b" speed={0.4} distort={0.35} geometry="torus" />
          <FloatingShape position={[-6, 0, -7]} scale={0.6} color="#06b6d4" speed={0.6} distort={0.25} geometry="octahedron" />
        </>
      )}
      
      {/* Interactive particle systems - use key to force fresh mount with correct count */}
      <InteractiveParticles 
        key={`particles-primary-${particleCount}`}
        count={particleCount} 
        color="#00ffff" 
        size={isMobile ? 0.025 : 0.02} 
        spread={isMobile ? 16 : 20} 
      />
      <InteractiveParticles 
        key={`particles-secondary-${secondaryParticleCount}`}
        count={secondaryParticleCount} 
        color="#a855f7" 
        size={isMobile ? 0.02 : 0.015} 
        spread={isMobile ? 18 : 25} 
      />
      
      {/* Glowing orbs with trails */}
      <GlowingOrbs />
      
      {/* Neural network visualization */}
      <NeuralNetwork nodeCount={isMobile ? 15 : 25} spread={isMobile ? 14 : 18} />
      
      {/* Animated grid floor */}
      <GridFloor />
      
      {/* Lighting - slightly brighter on mobile to compensate for fewer elements */}
      <ambientLight intensity={isMobile ? 0.2 : 0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} color="#00ffff" />
      <directionalLight position={[-5, -5, 5]} intensity={isMobile ? 0.25 : 0.3} color="#a855f7" />
      <pointLight position={[0, 0, 5]} intensity={isMobile ? 1.2 : 1.5} color="#00ffff" distance={25} decay={2} />
      <pointLight position={[-5, 3, -5]} intensity={isMobile ? 0.5 : 0.8} color="#ec4899" distance={20} decay={2} />
      
      {/* Additional lights on desktop */}
      {!isMobile && (
        <>
          <pointLight position={[5, -3, -8]} intensity={0.6} color="#a855f7" distance={20} decay={2} />
          <spotLight
            position={[0, 10, 5]}
            angle={0.3}
            penumbra={0.8}
            intensity={0.5}
            color="#ffffff"
            castShadow
          />
        </>
      )}
    </>
  );
};

export default FloatingGeometry;
