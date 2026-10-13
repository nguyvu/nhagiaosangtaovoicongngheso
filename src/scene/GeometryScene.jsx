import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Spherical, Vector3 } from 'three';
import CubeModel from './CubeModel';
import CuboidModel from './CuboidModel';
import CylinderModel from './CylinderModel';
import UnitCubeVisualization from './UnitCubeVisualization';
import { fitDistanceForExtent } from './cameraFit';
import UnfoldingModel from './UnfoldingModel';
import ShapeNet from '../components/ShapeNet';

const INITIAL_POSITION = [8, 6, 9];

function CameraControls({ command, dimensions, netActive }) {
  const controls = useRef();
  const lastCommand = useRef(null);
  const lastFit = useRef(null);
  const { camera, invalidate, size } = useThree();
  const extent = dimensions.radius !== undefined ? Math.max(2 * dimensions.radius, dimensions.h) : Math.max(dimensions.d, dimensions.r, dimensions.h);
  const fitDistance = fitDistanceForExtent(extent, size.width / size.height);
  const maxDistance = Math.max(65, fitDistance * 2);
  useEffect(() => {
    if (netActive || lastFit.current === fitDistance) return;
    lastFit.current = fitDistance;
    camera.position.normalize().multiplyScalar(fitDistance);
    controls.current?.update();
    invalidate();
  }, [fitDistance, netActive, camera, invalidate]);
  useEffect(() => {
    if (netActive || !controls.current || !command || command === lastCommand.current) return;
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
      if (command.action === 'out') spherical.radius = Math.min(maxDistance, spherical.radius * 1.25);
      camera.position.copy(new Vector3().setFromSpherical(spherical).add(orbit.target));
    }
    orbit.update(); invalidate();
  }, [command, netActive, camera, invalidate, fitDistance, maxDistance]);
  return <OrbitControls ref={controls} makeDefault enabled={!netActive} enablePan={false} minDistance={4} maxDistance={netActive ? Infinity : maxDistance} enableDamping={false} />;
}

export default function GeometryScene({ shape, dimensions, mode, showDimensions, showUnits, netActive, netExpanded, onNetComplete, command }) {
  const Model = { cube: CubeModel, cuboid: CuboidModel, cylinder: CylinderModel }[shape];
  return <Canvas frameloop="demand" dpr={[1, 1.75]} camera={{ position: INITIAL_POSITION, fov: 38 }} style={{ overflow: 'visible' }}
    fallback={<><p className="scene-fallback">Trình duyệt chưa hỗ trợ WebGL. Em vẫn có thể xem kiến thức và làm bài tập.</p>{netActive && <ShapeNet shape={shape} dimensions={dimensions} closing={!netExpanded} onCloseComplete={() => onNetComplete(false)} onOpenComplete={() => onNetComplete(true)} />}</>}>
    <ambientLight intensity={1.6} />
    <directionalLight position={[8, 12, 10]} intensity={2.4} />
    <directionalLight position={[-6, 0, -4]} intensity={.8} />
    {netActive ? <UnfoldingModel shape={shape} dimensions={dimensions} expanded={netExpanded} onComplete={onNetComplete} /> : showUnits ? <UnitCubeVisualization dimensions={dimensions} /> : <Model dimensions={dimensions} mode={mode} showDimensions={showDimensions} />}
    <CameraControls command={command} dimensions={dimensions} netActive={netActive} />
  </Canvas>;
}
