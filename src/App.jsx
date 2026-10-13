import { lazy, Suspense, useState } from 'react';
import ShapeIcon from './components/ShapeIcon';
import StudentFriends from './components/StudentFriends';
import ShapeNet from './components/ShapeNet';
import UiIcon from './components/UiIcon';
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
  const [netOpen, setNetOpen] = useState(false);
  const [netClosing, setNetClosing] = useState(false);
  const [command, setCommand] = useState(null);
  const mode = topic === 'features' ? feature : topic === 'area' ? area : null;
  const netVisible = topic === 'net' && netOpen;
  function toggleNet() {
    if (netClosing) return;
    if (!netOpen) setNetOpen(true);
    else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setNetOpen(false);
    else setNetClosing(true);
  }
  function finishNetClose() {
    setNetOpen(false);
    setNetClosing(false);
  }
  function selectTopic(next) {
    setTopic(previous => previous === next ? null : next);
    setNetOpen(false);
    setNetClosing(false);
  }
  return <section className="exploration" aria-label={`Khám phá ${shapeLessons[shape].name.toLowerCase()}`}>
    <div className="viewer-card">
      <div className="viewer-heading"><div><span className="eyebrow">PHÒNG KHÁM PHÁ 3D</span><h2>{shapeLessons[shape].name}</h2></div><span className="live-badge"><i /> Tương tác trực tiếp</span></div>
      <div className={`scene ${netVisible ? 'net-open' : ''} ${netClosing ? 'net-closing' : ''}`} role="img" aria-label={netVisible ? `Hình triển khai ${shapeLessons[shape].name.toLowerCase()}: bốn mặt bên màu hồng, hai mặt đáy màu xanh. ${shape === 'cube' ? 'Sáu mặt vuông bằng nhau.' : 'Hai mặt dài nhân cao, hai mặt rộng nhân cao và hai đáy dài nhân rộng.'}` : `Mô hình ${shapeLessons[shape].name.toLowerCase()}. Dùng chuột hoặc nút bên dưới để xoay và phóng to.`}>
        <Suspense fallback={<p className="scene-fallback">Đang chuẩn bị mô hình 3D…</p>}>
          <GeometryScene shape={shape} dimensions={geometry.dimensions} mode={mode} showDimensions={topic === 'dimensions'} showUnits={topic === 'volume' && units && canShowUnitCubes(geometry.dimensions)} command={command} />
        </Suspense>
        {netVisible ? <ShapeNet dimensions={geometry.dimensions} closing={netClosing} onCloseComplete={finishNetClose} /> : <span className="scene-tag">{topic === 'volume' && units && canShowUnitCubes(geometry.dimensions) ? 'Mỗi khối nhỏ: 1 cm³' : 'Kéo để xoay hình'}</span>}
      </div>
      {!netVisible && <ViewControls onAction={action => setCommand(previous => ({ action, id: (previous?.id ?? 0) + 1 }))} />}
      <p className="viewer-hint">{netVisible ? shape === 'cube' ? 'Sáu hình vuông bằng nhau tạo nên sáu mặt của hình lập phương.' : 'Ba cặp hình chữ nhật tạo nên sáu mặt của hình hộp chữ nhật.' : <>Kéo chuột để xoay · Cuộn hoặc chụm hai ngón để zoom<br /><span>Zoom chỉ đổi góc nhìn, không đổi kích thước hình.</span></>}</p>
    </div>
    <aside className="explore-card">
      <div className="section-heading"><span className="step">02</span><h2>Cùng tìm hiểu nhé!</h2></div>
      <p className="panel-intro">Em muốn khám phá điều gì?</p>
      <ExploreControls topic={topic} onSelect={selectTopic} />
      <KnowledgePanel {...{ shape, topic, feature, setFeature, area, setArea, units, setUnits, netOpen, geometry, exerciseState }} onNetToggle={toggleNet} />
    </aside>
  </section>;
}

export default function App() {
  const [shape, setShape] = useState('cube');
  return <>
    <a href="#main" className="skip-link">Đến nội dung chính</a>
    <header className="site-header"><div className="header-inner"><a href="#main" className="brand"><span className="brand-symbol"><ShapeIcon /></span><span>Nhà kiến tạo<span className="brand-second">hình học</span></span></a><span className="grade-badge">TOÁN LỚP 5 <span>·</span> HỌC QUA KHÁM PHÁ</span></div></header>
    <main id="main">
      <section className="intro"><div><span className="eyebrow">CHÀO MỪNG NHÀ KIẾN TẠO NHÍ</span><h1>Chạm vào hình khối.<br /><em>Mở ra điều thú vị.</em></h1><p>Xoay một chút, thử một chút — cùng khám phá<br className="desktop-break" /> thế giới hình học theo cách của em!</p></div><div className="intro-art" aria-hidden="true"><StudentFriends /><span className="art-caption">Học bằng cách thử!</span></div></section>
      <ShapeSelector shape={shape} onSelect={setShape} />
      <Exploration key={shape} shape={shape} />
      <div className="discovery-note"><UiIcon name="hint" /><p><strong>Một gợi ý nhỏ:</strong> Hãy thử xoay hình để nhìn mặt phía sau. Em tìm được điều gì mới?</p></div>
    </main>
    <footer><span>Nhà kiến tạo hình học <span aria-hidden="true">✦</span> Mỗi ngày một khám phá</span><span>Bản mẫu giáo dục · Nội dung cần giáo viên rà soát</span></footer>
  </>;
}
