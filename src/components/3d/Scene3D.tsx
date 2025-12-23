import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import FloatingGeometry from './FloatingGeometry';

const Scene3D = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
          />
          <fog attach="fog" args={['#0a0a0f', 5, 30]} />
          <FloatingGeometry />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
