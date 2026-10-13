import { useEffect, useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import { CylinderGeometry, Float32BufferAttribute } from 'three';

function Rim({ radius, y, color, emphasized = false }) {
  const points = useMemo(() => Array.from({ length: 97 }, (_, index) => {
    const angle = index / 96 * Math.PI * 2;
    return [radius * Math.cos(angle), y, radius * Math.sin(angle)];
  }), [radius, y]);
  return <Line points={points} color={color} lineWidth={emphasized ? 3 : 1.5} depthTest={!emphasized} />;
}

export default function CylinderModel({ dimensions: { radius, h }, mode, showDimensions }) {
  const geometry = useMemo(() => {
    const result = new CylinderGeometry(radius, radius, h, 96);
    const normals = result.getAttribute('normal');
    const colors = [];
    // Soft shading shows the curved side without making the pink depend on lighting.
    for (let index = 0; index < normals.count; index++) {
      const facing = normals.getX(index) * .5 + normals.getZ(index) * .866;
      const shade = Math.abs(normals.getY(index)) > .5 ? 1 : .74 + .26 * (facing + 1) / 2;
      colors.push(shade, shade, shade);
    }
    result.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return result;
  }, [radius, h]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const sideHighlighted = mode === 'faces' || mode === 'lateral' || mode === 'total';
  const baseColor = mode === 'faces' ? '#62bcb2' : mode === 'total' ? '#ea75a1' : '#e691ba';
  const rimColor = mode === 'edges' ? '#8751d0' : '#9d5471';
  return <group>
    <mesh geometry={geometry}>
      <meshBasicMaterial attach="material-0" vertexColors color={sideHighlighted ? '#ea75a1' : '#df85ad'} toneMapped={false} transparent opacity={mode === 'edges' ? .35 : 1} depthWrite={mode !== 'edges'} />
      <meshBasicMaterial attach="material-1" color={baseColor} toneMapped={false} transparent opacity={mode === 'edges' ? .35 : 1} depthWrite={mode !== 'edges'} />
      <meshBasicMaterial attach="material-2" color={baseColor} toneMapped={false} transparent opacity={mode === 'edges' ? .35 : 1} depthWrite={mode !== 'edges'} />
    </mesh>
    <Rim radius={radius} y={h / 2} color={rimColor} emphasized={mode === 'edges'} />
    <Rim radius={radius} y={-h / 2} color={rimColor} emphasized={mode === 'edges'} />
    {showDimensions && <>
      <Line points={[[0, h / 2, 0], [radius, h / 2, 0]]} color="#176b47" lineWidth={2.5} depthTest={false} />
      <Line points={[[radius + .25, -h / 2, 0], [radius + .25, h / 2, 0]]} color="#176b47" lineWidth={2.5} depthTest={false} />
      <Html position={[radius / 2, h / 2 + .25, 0]} center style={{ pointerEvents: 'none' }}><span className="dimension-label">r = {radius} cm</span></Html>
      <Html position={[radius + .5, 0, 0]} center style={{ pointerEvents: 'none' }}><span className="dimension-label">h = {h} cm</span></Html>
    </>}
  </group>;
}
