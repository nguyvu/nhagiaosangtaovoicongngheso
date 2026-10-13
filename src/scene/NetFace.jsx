import { useEffect, useMemo, useRef, useImperativeHandle } from 'react';
import { Edges, Line } from '@react-three/drei';
import { CanvasTexture, DoubleSide, BufferGeometry, Vector3 } from 'three';
import { getNetLabelLayout } from '../utils/unfolding';

export function NetNumber({ number, size, width, height, radius, base, controllerRef }) {
  const sprite = useRef();
  const material = useRef();
  const line = useRef();
  const lineMaterial = useRef();
  const leader = useMemo(() => new BufferGeometry().setFromPoints([new Vector3(), new Vector3()]), []);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = '#493342';
    context.font = '700 96px "Geometry Nunito", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(String(number), 64, 68);
    return new CanvasTexture(canvas);
  }, [number]);
  useEffect(() => () => { texture.dispose(); leader.dispose(); }, [texture, leader]);
  useImperativeHandle(controllerRef, () => ({
    update(opacity, pixelsPerUnit) {
      if (!sprite.current || !material.current || !line.current || !lineMaterial.current) return;
      const layout = getNetLabelLayout({ width, height, radius, base, naturalSize: size }, pixelsPerUnit);
      sprite.current.position.set(layout.x, layout.y, .02);
      sprite.current.scale.set(layout.size, layout.size, 1);
      material.current.opacity = opacity;
      line.current.visible = layout.external && opacity > 0;
      lineMaterial.current.opacity = opacity;
      const positions = leader.getAttribute('position');
      positions.setXYZ(0, layout.anchorX, layout.anchorY, .015);
      positions.setXYZ(1, layout.x, layout.y, .015);
      positions.needsUpdate = true;
    },
  }), [width, height, radius, base, size, leader]);
  return <group>
    <line ref={line} geometry={leader} frustumCulled={false} renderOrder={100}>
      <lineBasicMaterial ref={lineMaterial} color="#493342" transparent opacity={0} depthTest={false} toneMapped={false} />
    </line>
    <sprite ref={sprite} position={[0, 0, .02]} scale={[size, size, 1]} renderOrder={101}>
      <spriteMaterial ref={material} map={texture} transparent opacity={0} depthTest={false} toneMapped={false} />
    </sprite>
  </group>;
}

export default function NetFace({ number, width, height, radius, base, color, matrix, groupRef, materialRef, numberRef }) {
  const circle = useMemo(() => radius ? Array.from({ length: 97 }, (_, index) => {
    const angle = index / 96 * Math.PI * 2;
    return [radius * Math.cos(angle), radius * Math.sin(angle), .002];
  }) : [], [radius]);
  const numberSize = radius ? radius * .65 : Math.min(width, height) * .38;
  return <group ref={groupRef} matrix={matrix} matrixAutoUpdate={false}>
    <mesh>
      {radius ? <circleGeometry args={[radius, 96]} /> : <planeGeometry args={[width, height]} />}
      <meshBasicMaterial ref={materialRef} color={color} side={DoubleSide} toneMapped={false} />
      {!radius && <Edges position={[0, 0, .008]} color={base ? '#2e7768' : '#87516b'} lineWidth={1.5} />}
    </mesh>
    {radius && <Line points={circle} color="#2e7768" lineWidth={1.5} />}
    <NetNumber number={number} size={numberSize} width={width} height={height} radius={radius} base={base} controllerRef={numberRef} />
  </group>;
}
