import { useLayoutEffect, useMemo, useRef } from 'react';
import { Object3D } from 'three';
import { getUnitPositions } from '../utils/geometry';

export default function UnitCubeVisualization({ dimensions }) {
  const mesh = useRef();
  const positions = useMemo(() => getUnitPositions(dimensions), [dimensions]);
  useLayoutEffect(() => {
    const object = new Object3D();
    positions.forEach((position, index) => {
      object.position.set(...position); object.updateMatrix();
      mesh.current.setMatrixAt(index, object.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [positions]);
  return <instancedMesh ref={mesh} args={[null, null, positions.length]}>
    <boxGeometry args={[.94, .94, .94]} />
    <meshStandardMaterial color="#e982a8" roughness={.6} />
  </instancedMesh>;
}
