import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { getNetViewDistance, getUnfoldingPoints, getUnfoldingFrameDistance, NET_ANIMATION_SECONDS, smoothProgress, stageProgress } from '../utils/unfolding';
import BoxUnfolding from './BoxUnfolding';
import CylinderUnfolding from './CylinderUnfolding';

export default function UnfoldingModel({ shape, dimensions, expanded, onComplete }) {
  const { camera, size, invalidate } = useThree();
  const model = useRef();
  const progress = useRef(0);
  const tween = useRef(null);
  const completed = useRef(false);
  const callback = useRef(onComplete);
  callback.current = onComplete;
  const savedCamera = useMemo(() => ({ position: camera.position.clone(), quaternion: camera.quaternion.clone(), up: camera.up.clone() }), [camera]);
  const direction = useMemo(() => new Vector3(), []);
  const front = useMemo(() => new Vector3(0, 0, 1), []);
  const tangent = Math.tan(camera.fov * Math.PI / 360);
  const openDistance = getNetViewDistance(dimensions, size.width, size.height, camera.fov);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = () => {
      const target = expanded ? 1 : 0;
      tween.current = { from: progress.current, target, start: performance.now(), duration: media.matches ? 0 : NET_ANIMATION_SECONDS * 1000 * Math.abs(target - progress.current) };
      completed.current = false;
      invalidate();
    };
    start();
    media.addEventListener('change', start);
    return () => media.removeEventListener('change', start);
  }, [expanded, invalidate]);
  useEffect(() => () => {
    camera.position.copy(savedCamera.position);
    camera.quaternion.copy(savedCamera.quaternion);
    camera.up.copy(savedCamera.up);
    invalidate();
  }, [camera, savedCamera, invalidate]);
  useFrame(() => {
    const animation = tween.current;
    if (!animation || !model.current) return;
    const t = animation.duration === 0 ? 1 : Math.min(1, (performance.now() - animation.start) / animation.duration);
    const p = animation.from + (animation.target - animation.from) * smoothProgress(t);
    progress.current = p;
    const cameraProgress = smoothProgress(Math.min(1, p * 1.35));
    direction.copy(savedCamera.position).normalize().lerp(front, p).normalize();
    const desiredDistance = savedCamera.position.length() * (1 - cameraProgress) + openDistance * cameraProgress;
    const safeDistance = getUnfoldingFrameDistance(getUnfoldingPoints(shape, dimensions, p), direction, size.width / size.height, camera.fov);
    const distance = desiredDistance + Math.max(0, safeDistance - desiredDistance) * stageProgress(p, 0, .06);
    camera.position.copy(direction).multiplyScalar(distance);
    camera.lookAt(0, 0, 0);
    model.current.update(p, size.height / (2 * tangent * distance));
    if (t < 1) invalidate();
    else if (!completed.current) {
      completed.current = true;
      callback.current(animation.target === 1);
    }
  });
  const Model = shape === 'cylinder' ? CylinderUnfolding : BoxUnfolding;
  return <Model dimensions={dimensions} controllerRef={model} />;
}
