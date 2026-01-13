import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import FloatingGeometry from './FloatingGeometry';
import { useIsMobile } from '@/hooks/use-mobile';

const Scene3D = () => {
  const isMobile = useIsMobile();
  
  // Adjust camera and controls based on device
  const cameraConfig = useMemo(() => ({
    position: isMobile ? [0, 0, 14] as [number, number, number] : [0, 0, 10] as [number, number, number],
    fov: isMobile ? 70 : 60
  }), [isMobile]);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        dpr={isMobile ? [1, 1.5] : [1, 2]} // Lower pixel ratio on mobile for performance
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={cameraConfig.position} fov={cameraConfig.fov} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={isMobile ? 0.3 : 0.5}
          />
          <fog attach="fog" args={['#0a0a0f', isMobile ? 3 : 5, isMobile ? 20 : 30]} />
          <FloatingGeometry isMobile={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
