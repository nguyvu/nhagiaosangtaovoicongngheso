import { lazy, Suspense, useState } from 'react';
import ShapeIcon from './components/ShapeIcon';
import ShapeSelector from './components/ShapeSelector';
import ExploreControls from './components/ExploreControls';
import KnowledgePanel from './components/KnowledgePanel';
import ViewControls from './components/ViewControls';
import { useGeometry } from './hooks/useGeometry';
import { useExercises } from './hooks/useExercises';
import { shapeLessons } from './data/shapeLessons';
import { canShowUnitCubes } from './utils/geometry';

const GeometryScene = lazy(() => import('./scene/GeometryScene'));

function Exploration({ shape }) {
  const geometry = useGeometry(shape);
  const exerciseState = useExercises(shape);
  const [topic, setTopic] = useState(null);
  const [feature, setFeature] = useState('vertices');
  const [area, setArea] = useState('lateral');
  const [units, setUnits] = useState(false);
  const [command, setCommand] = useState(null);
  const mode = topic === 'features' ? feature : topic === 'area' ? area : null;
  return <section className="exploration" aria-label={`Khám phá ${shapeLessons[shape].name.toLowerCase()}`}>
    <div className="viewer-card">
      <div className="viewer-heading"><div><span className="eyebrow">PHÒNG KHÁM PHÁ 3D</span><h2>{shapeLessons[shape].name}</h2></div><span className="live-badge"><i /> Tương tác trực tiếp</span></div>
      <div className="scene" role="img" aria-label={`Mô hình ${shapeLessons[shape].name.toLowerCase()}. Dùng chuột hoặc nút bên dưới để xoay và phóng to.`}>
        <Suspense fallback={<p className="scene-fallback">Đang chuẩn bị mô hình 3D…</p>}>
          <GeometryScene shape={shape} dimensions={geometry.dimensions} mode={mode} showDimensions={topic === 'dimensions'} showUnits={topic === 'volume' && units && canShowUnitCubes(geometry.dimensions)} command={command} />
        </Suspense>
        <span className="scene-tag">{topic === 'volume' && units && canShowUnitCubes(geometry.dimensions) ? 'Mỗi khối nhỏ: 1 cm³' : 'Kéo để xoay hình'}</span>
      </div>
      <ViewControls onAction={action => setCommand(previous => ({ action, id: (previous?.id ?? 0) + 1 }))} />
      <p className="viewer-hint">Kéo chuột để xoay · Cuộn hoặc chụm hai ngón để zoom<br /><span>Zoom chỉ đổi góc nhìn, không đổi kích thước hình.</span></p>
    </div>
    <aside className="explore-card">
      <div className="section-heading"><span className="step">02</span><h2>Cùng tìm hiểu nhé!</h2></div>
      <p className="panel-intro">Em muốn khám phá điều gì?</p>
      <ExploreControls topic={topic} onSelect={next => setTopic(previous => previous === next ? null : next)} />
      <KnowledgePanel {...{ shape, topic, feature, setFeature, area, setArea, units, setUnits, geometry, exerciseState }} />
    </aside>
  </section>;
}

export default function App() {
  const [shape, setShape] = useState('cube');
  return <>
    <a href="#main" className="skip-link">Đến nội dung chính</a>
    <header className="site-header"><div className="header-inner"><a href="#main" className="brand"><span className="brand-symbol"><ShapeIcon /></span><span>Nhà kiến tạo<span className="brand-second">hình học</span></span></a><span className="grade-badge">TOÁN LỚP 5 <span>·</span> HỌC QUA KHÁM PHÁ</span></div></header>
    <main id="main">
      <section className="intro"><div><span className="eyebrow">CHÀO MỪNG NHÀ KIẾN TẠO NHÍ</span><h1>Chạm vào hình khối.<br /><em>Mở ra điều thú vị.</em></h1><p>Xoay một chút, thử một chút — cùng khám phá<br className="desktop-break" /> thế giới hình học theo cách của em!</p></div><div className="intro-art" aria-hidden="true"><span className="spark spark-one">✦</span><ShapeIcon /><span className="spark spark-two">✧</span><span className="art-caption">Học bằng cách thử!</span></div></section>
      <ShapeSelector shape={shape} onSelect={setShape} />
      <Exploration key={shape} shape={shape} />
      <div className="discovery-note"><span aria-hidden="true">✧</span><p><strong>Một gợi ý nhỏ:</strong> Hãy thử xoay hình để nhìn mặt phía sau. Em tìm được điều gì mới?</p></div>
    </main>
    <footer><span>Nhà kiến tạo hình học <span aria-hidden="true">✦</span> Mỗi ngày một khám phá</span><span>Bản mẫu giáo dục · Nội dung cần giáo viên rà soát</span></footer>
  </>;
}
