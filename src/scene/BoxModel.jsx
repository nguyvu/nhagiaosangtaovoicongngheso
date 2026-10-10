import { Edges, Html } from '@react-three/drei';
import { isHighlightedFace } from '../utils/geometry';

export default function BoxModel({ dimensions: { d, r, h }, mode, showDimensions, cube }) {
  const vertices = [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z => [x * d / 2, y * h / 2, z * r / 2])));
  const labels = cube ? [{ position: [0, -h / 2 - .35, r / 2], text: `a = ${d} cm` }] : [
    { position: [0, -h / 2 - .35, r / 2], text: `d = ${d} cm` },
    { position: [d / 2 + .45, -h / 2, 0], text: `r = ${r} cm` },
    { position: [-d / 2 - .5, 0, r / 2], text: `h = ${h} cm` },
  ];
  return <group>
    <mesh>
      <boxGeometry args={[d, h, r]} />
      {Array.from({ length: 6 }, (_, index) => <meshStandardMaterial key={index} attach={`material-${index}`} roughness={.65}
        color={isHighlightedFace(index, mode) ? (mode === 'faces' && (index === 2 || index === 3) ? '#62bcb2' : '#ea75a1') : '#f2dfe7'}
        transparent opacity={mode === 'vertices' || mode === 'edges' ? .3 : 1} depthWrite={mode !== 'vertices' && mode !== 'edges'} />)}
      <Edges color={mode === 'edges' ? '#8751d0' : '#9d5471'} lineWidth={mode === 'edges' ? 3 : 1.5} />
    </mesh>
    {mode === 'vertices' && vertices.map((position, index) => <mesh key={index} position={position}>
      <sphereGeometry args={[.115, 16, 16]} /><meshBasicMaterial color="#703bbb" depthTest={false} />
    </mesh>)}
    {showDimensions && labels.map(label => <Html key={label.text} position={label.position} center style={{ pointerEvents: 'none' }}><span className="dimension-label">{label.text}</span></Html>)}
  </group>;
}
