import { useImperativeHandle, useMemo, useRef } from 'react';
import { Color } from 'three';
import { getBoxNetFaces, stageProgress } from '../utils/unfolding';
import NetFace from './NetFace';

export default function BoxUnfolding({ dimensions, controllerRef }) {
  const groups = useRef([]);
  const materials = useRef([]);
  const numbers = useRef([]);
  const { d, r, h } = dimensions;
  const faces = useMemo(() => getBoxNetFaces({ d, r, h }, 0), [d, r, h]);
  const colors = useMemo(() => faces.map(face => ({ closed: new Color(face.color), open: new Color(face.base ? '#b8e5dd' : '#f8d2df') })), [faces]);
  useImperativeHandle(controllerRef, () => ({
    update(progress, pixelsPerUnit) {
      getBoxNetFaces(dimensions, progress).forEach((face, index) => {
        if (!groups.current[index]) return;
        groups.current[index].matrix.copy(face.matrix);
        groups.current[index].matrixWorldNeedsUpdate = true;
        materials.current[index]?.color.copy(colors[index].closed).lerp(colors[index].open, progress);
        numbers.current[index]?.update(stageProgress(progress, .55, .9), pixelsPerUnit);
      });
    },
  }), [dimensions, colors]);
  return <group>{faces.map((face, index) => <NetFace key={face.number} {...face}
    groupRef={group => { groups.current[index] = group; }} materialRef={material => { materials.current[index] = material; }} numberRef={material => { numbers.current[index] = material; }} />)}</group>;
}
