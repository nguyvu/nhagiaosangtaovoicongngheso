import { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { BufferGeometry, Float32BufferAttribute, Color, DoubleSide } from 'three';
import { getCylinderCapMatrices, getCylinderStripPoint, stageProgress } from '../utils/unfolding';
import NetFace, { NetNumber } from './NetFace';

const SEGMENTS = 96;

export default function CylinderUnfolding({ dimensions, controllerRef }) {
  const { radius, h } = dimensions;
  const sideMaterial = useRef();
  const sideNumber = useRef();
  const numberGroup = useRef();
  const caps = useRef([]);
  const capMaterials = useRef([]);
  const capNumbers = useRef([]);
  const geometry = useMemo(() => {
    const surface = new BufferGeometry();
    const outline = new BufferGeometry();
    const count = (SEGMENTS + 1) * 2;
    surface.setAttribute('position', new Float32BufferAttribute(new Float32Array(count * 3), 3));
    surface.setAttribute('color', new Float32BufferAttribute(new Float32Array(count * 3), 3));
    const indices = [];
    for (let i = 0; i < SEGMENTS; i++) indices.push(i, i + 1, i + SEGMENTS + 1, i + SEGMENTS + 1, i + 1, i + SEGMENTS + 2);
    surface.setIndex(indices);
    outline.setAttribute('position', new Float32BufferAttribute(new Float32Array(count * 3), 3));
    return { surface, outline };
  }, []);
  useEffect(() => () => { geometry.surface.dispose(); geometry.outline.dispose(); }, [geometry]);
  const colors = useMemo(() => ({ side: new Color('#df85ad'), sideOpen: new Color('#f8d2df'), base: new Color('#e691ba'), baseOpen: new Color('#b8e5dd') }), []);
  const matrices = useMemo(() => getCylinderCapMatrices({ radius, h }, 0), [radius, h]);
  useImperativeHandle(controllerRef, () => ({
    update(progress, pixelsPerUnit) {
      const rolled = stageProgress(progress, .2, 1);
      const positions = geometry.surface.getAttribute('position');
      const vertexColors = geometry.surface.getAttribute('color');
      const outline = geometry.outline.getAttribute('position');
      for (let i = 0; i <= SEGMENTS; i++) {
        const arc = (i / SEGMENTS - .5) * 2 * Math.PI * radius;
        const [x, z] = getCylinderStripPoint(radius, arc, rolled);
        const facing = Math.sin(arc / radius) * .5 + Math.cos(arc / radius) * .866;
        const shade = (.74 + .26 * (facing + 1) / 2) * (1 - rolled) + rolled;
        positions.setXYZ(i, x, -h / 2, z);
        positions.setXYZ(i + SEGMENTS + 1, x, h / 2, z);
        vertexColors.setXYZ(i, shade, shade, shade);
        vertexColors.setXYZ(i + SEGMENTS + 1, shade, shade, shade);
        outline.setXYZ(i, x, -h / 2, z);
        outline.setXYZ(2 * SEGMENTS + 1 - i, x, h / 2, z);
      }
      positions.needsUpdate = true;
      vertexColors.needsUpdate = true;
      outline.needsUpdate = true;
      // Bounds change as the side unrolls; stale bounds could hide the open rectangle.
      geometry.surface.computeBoundingSphere();
      geometry.outline.computeBoundingSphere();
      sideMaterial.current?.color.copy(colors.side).lerp(colors.sideOpen, progress);
      if (numberGroup.current) numberGroup.current.position.z = radius * (1 - rolled) + .012;
      sideNumber.current?.update(stageProgress(progress, .55, .9), pixelsPerUnit);
      getCylinderCapMatrices(dimensions, progress).forEach((matrix, index) => {
        if (!caps.current[index]) return;
        caps.current[index].matrix.copy(matrix);
        caps.current[index].matrixWorldNeedsUpdate = true;
        capMaterials.current[index]?.color.copy(colors.base).lerp(colors.baseOpen, progress);
        capNumbers.current[index]?.update(stageProgress(progress, .55, .9), pixelsPerUnit);
      });
    },
  }), [geometry, colors, dimensions, radius, h]);
  return <group>
    <mesh geometry={geometry.surface} frustumCulled={false}><meshBasicMaterial ref={sideMaterial} vertexColors color="#df85ad" side={DoubleSide} toneMapped={false} /></mesh>
    <lineLoop geometry={geometry.outline} frustumCulled={false}><lineBasicMaterial color="#87516b" toneMapped={false} /></lineLoop>
    <group ref={numberGroup}><NetNumber number={1} size={Math.min(2 * radius, h) * .35} width={2 * Math.PI * radius} height={h} controllerRef={sideNumber} /></group>
    {matrices.map((matrix, index) => <NetFace key={index} number={index + 2} radius={radius} base color="#e691ba" matrix={matrix}
      groupRef={group => { caps.current[index] = group; }} materialRef={material => { capMaterials.current[index] = material; }} numberRef={material => { capNumbers.current[index] = material; }} />)}
  </group>;
}
