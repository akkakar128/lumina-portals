import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NeuralNetworkProps {
  nodeCount?: number;
  spread?: number;
}

const NeuralNetwork = ({ nodeCount = 30, spread = 15 }: NeuralNetworkProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Generate node positions
  const nodes = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < nodeCount; i++) {
      positions.push([
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.6,
        (Math.random() - 0.5) * spread - 8
      ]);
    }
    return positions;
  }, [nodeCount, spread]);

  // Generate connections between nearby nodes
  const connections = useMemo(() => {
    const lines: number[] = [];
    const connectionDistance = spread * 0.4;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dz = nodes[i][2] - nodes[j][2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance < connectionDistance) {
          lines.push(...nodes[i], ...nodes[j]);
        }
      }
    }
    return new Float32Array(lines);
  }, [nodes, spread]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.15) * 0.1;
    }
  });

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(connections, 3));
    return geometry;
  }, [connections]);

  return (
    <group ref={groupRef}>
      {/* Network nodes */}
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial 
            color={i % 3 === 0 ? '#00ffff' : i % 3 === 1 ? '#a855f7' : '#ec4899'} 
            transparent 
            opacity={0.8}
          />
        </mesh>
      ))}
      
      {/* Network connections */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
};

export default NeuralNetwork;
