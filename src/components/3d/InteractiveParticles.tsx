import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface InteractiveParticlesProps {
  count?: number;
  color?: string;
  size?: number;
  spread?: number;
}

const InteractiveParticles = ({ 
  count = 2000, 
  color = '#00ffff',
  size = 0.015,
  spread = 25
}: InteractiveParticlesProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { viewport } = useThree();

  // Generate particle positions
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = Math.random() * spread;
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi) - 10;
      
      vel[i3] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return [pos, vel];
  }, [count, spread]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Gentler wave motion with reduced amplitude
      positions[i3] += Math.sin(time * 0.5 + i * 0.005) * 0.0008;
      positions[i3 + 1] += Math.cos(time * 0.5 + i * 0.005) * 0.0008;
      
      // Smoother mouse influence with reduced force
      const dx = mousePosition.x * viewport.width * 0.5 - positions[i3];
      const dy = mousePosition.y * viewport.height * 0.5 - positions[i3 + 1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 5) {
        const force = (5 - distance) * 0.0002;
        positions[i3] -= dx * force;
        positions[i3 + 1] -= dy * force;
      }
      
      // Slower velocity application
      positions[i3] += velocities[i3] * 0.4;
      positions[i3 + 1] += velocities[i3 + 1] * 0.4;
      positions[i3 + 2] += velocities[i3 + 2] * 0.4;
      
      // Softer boundary wrap
      if (Math.abs(positions[i3]) > spread) positions[i3] *= -0.95;
      if (Math.abs(positions[i3 + 1]) > spread) positions[i3 + 1] *= -0.95;
      if (positions[i3 + 2] > 5 || positions[i3 + 2] < -spread) positions[i3 + 2] *= -0.95;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    // Slower rotation
    pointsRef.current.rotation.y = time * 0.008;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.8}
      />
    </Points>
  );
};

export default InteractiveParticles;
