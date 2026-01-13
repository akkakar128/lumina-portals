import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo, useState, useEffect } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import FloatingGeometry from './FloatingGeometry';

const Scene3D = () => {
  // Determine mobile once on mount to avoid dynamic changes causing Three.js errors
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());
    // Don't add resize listener - keep initial value to prevent buffer resize errors
  }, []);
  
  // Adjust camera and controls based on device
  const cameraConfig = useMemo(() => ({
    position: isMobile ? [0, 0, 12] as [number, number, number] : [0, 0, 10] as [number, number, number],
    fov: isMobile ? 65 : 60
  }), [isMobile]);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        performance={{ min: 0.5 }}
        key={isMobile ? 'mobile' : 'desktop'} // Force remount on device change
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
          <fog attach="fog" args={['#0a0a0f', isMobile ? 4 : 5, isMobile ? 25 : 30]} />
          <FloatingGeometry isMobile={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
