import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Spherical, Vector3 } from 'three';
import CubeModel from './CubeModel';
import CuboidModel from './CuboidModel';
import UnitCubeVisualization from './UnitCubeVisualization';

const INITIAL_POSITION = [8, 6, 9];

function CameraControls({ command, dimensions }) {
  const controls = useRef();
  const lastCommand = useRef(null);
  const { camera, invalidate, size } = useThree();
  const extent = Math.max(dimensions.d, dimensions.r, dimensions.h);
  const fitDistance = Math.max(12, extent * 3.3 * Math.max(1, size.height / size.width));
  useEffect(() => {
    camera.position.normalize().multiplyScalar(fitDistance);
    controls.current?.update();
    invalidate();
  }, [fitDistance, camera, invalidate]);
  useEffect(() => {
    if (!controls.current || !command || command === lastCommand.current) return;
    lastCommand.current = command;
    const orbit = controls.current;
    if (command.action === 'reset') {
      camera.position.set(...INITIAL_POSITION).normalize().multiplyScalar(fitDistance); orbit.target.set(0, 0, 0);
    } else {
      const offset = camera.position.clone().sub(orbit.target);
      const spherical = new Spherical().setFromVector3(offset);
      if (command.action === 'left') spherical.theta -= Math.PI / 8;
      if (command.action === 'right') spherical.theta += Math.PI / 8;
      if (command.action === 'in') spherical.radius = Math.max(4, spherical.radius * .8);
      if (command.action === 'out') spherical.radius = Math.min(65, spherical.radius * 1.25);
      camera.position.copy(new Vector3().setFromSpherical(spherical).add(orbit.target));
    }
    orbit.update(); invalidate();
  }, [command, camera, invalidate, fitDistance]);
  return <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={4} maxDistance={65} enableDamping={false} />;
}

export default function GeometryScene({ shape, dimensions, mode, showDimensions, showUnits, command }) {
  const Model = shape === 'cube' ? CubeModel : CuboidModel;
  return <Canvas frameloop="demand" dpr={[1, 1.75]} camera={{ position: INITIAL_POSITION, fov: 38 }} style={{ overflow: 'visible' }}
    fallback={<p className="scene-fallback">Trình duyệt chưa hỗ trợ WebGL. Em vẫn có thể xem kiến thức và làm bài tập.</p>}>
    <ambientLight intensity={1.6} />
    <directionalLight position={[8, 12, 10]} intensity={2.4} />
    <directionalLight position={[-6, 0, -4]} intensity={.8} />
    {showUnits ? <UnitCubeVisualization dimensions={dimensions} /> : <Model dimensions={dimensions} mode={mode} showDimensions={showDimensions} />}
    <CameraControls command={command} dimensions={dimensions} />
  </Canvas>;
}
