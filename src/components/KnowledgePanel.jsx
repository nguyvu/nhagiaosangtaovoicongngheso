import DimensionControls from './DimensionControls';
import ExercisePanel from './ExercisePanel';
import { shapeLessons } from '../data/shapeLessons';
import { MAX_UNIT_CUBES, SOLID_COUNTS, canShowUnitCubes } from '../utils/geometry';

function ChoiceButtons({ options, value, onChange }) {
  return <div className="choice-buttons">{options.map(([id, label]) => <button key={id} aria-pressed={value === id} className={value === id ? 'active' : ''} onClick={() => onChange(id)}>{label}</button>)}</div>;
}

export default function KnowledgePanel({ shape, topic, feature, setFeature, area, setArea, units, setUnits, netOpen, onNetToggle, geometry, exerciseState }) {
  const { values, dimensions: { d, r, h }, dimensions, results, setDimension } = geometry;
  const cube = shape === 'cube';
  const lateral = area === 'lateral';
  let formula;
  let substitution;
  if (topic === 'area') {
    formula = cube ? (lateral ? 'Sxq = 4 × a × a' : 'Stp = 6 × a × a') : (lateral ? 'Sxq = 2 × (d + r) × h' : 'Stp = 2 × (d × r + d × h + r × h)');
    substitution = cube ? `${lateral ? 4 : 6} × ${d} × ${d}` : lateral ? `2 × (${d} + ${r}) × ${h}` : `2 × (${d} × ${r} + ${d} × ${h} + ${r} × ${h})`;
  }
  return <div id="knowledge-content" className="knowledge-content">
    {!topic && <div className="empty-panel"><h3>Mỗi góc nhìn, một khám phá!</h3><p>Chọn một mục ở trên để tìm hiểu hình. Em có thể bấm lần nữa để đóng nội dung.</p></div>}
    {topic === 'features' && <>
      <ChoiceButtons options={[[ 'vertices', 'Xem đỉnh' ], [ 'edges', 'Xem cạnh' ], [ 'faces', 'Xem mặt' ]]} value={feature} onChange={setFeature} />
      <div className="fact-number">{SOLID_COUNTS[feature]} <span>{feature === 'vertices' ? 'đỉnh' : feature === 'edges' ? 'cạnh' : 'mặt'}</span></div>
      <p>{feature === 'vertices' ? 'Đỉnh là điểm gặp nhau của các cạnh. Các chấm tím đánh dấu từng đỉnh.' : feature === 'edges' ? 'Cạnh là đoạn thẳng nơi hai mặt gặp nhau. Hãy xoay hình để tìm các cạnh phía sau.' : shapeLessons[shape].faces}</p>
      {feature === 'faces' && <p className="note">Bốn mặt bên màu hồng. Hai mặt đáy ở trên và dưới màu xanh, theo hướng đặt hình ban đầu.</p>}
    </>}
    {topic === 'net' && <div className="net-lesson">
      <h3>Trải {shapeLessons[shape].name.toLowerCase()}</h3>
      <p>{cube ? 'Hình lập phương có 6 mặt vuông bằng nhau.' : 'Hình hộp chữ nhật có 3 cặp mặt đối diện bằng nhau.'} Bấm nút để trải các mặt ra, rồi ghép lại thành khối.</p>
      <button type="button" className="primary" aria-pressed={netOpen} onClick={onNetToggle}>{netOpen ? 'Ghép lại thành khối' : cube ? 'Trải thành 6 hình vuông' : 'Trải 6 mặt chữ nhật'}</button>
      {netOpen && <>
        <p className="net-legend"><span><i className="net-swatch side" /> Số 1–4: bốn mặt bên</span><span><i className="net-swatch base" /> Số 5–6: hai mặt đáy</span></p>
        {cube ? <div className="formula"><strong>Diện tích mỗi mặt vuông</strong><span>{d} × {d} =</span><b>{d * d} cm²</b></div> : <div className="formula"><strong>Diện tích từng cặp mặt</strong><span>Số 1 và 3 (dài × cao): {d} × {h} = <b>{d * h} cm²</b> mỗi mặt</span><span>Số 2 và 4 (rộng × cao): {r} × {h} = <b>{r * h} cm²</b> mỗi mặt</span><span>Số 5 và 6 (dài × rộng): {d} × {r} = <b>{d * r} cm²</b> mỗi mặt</span></div>}
        <p>Cả 6 mặt: <strong>{results.totalArea} cm²</strong>. Bốn mặt bên: <strong>{results.lateralArea} cm²</strong>.</p>
        <p className="muted">{cube ? `Các ô vuông chỉ minh họa cách trải mặt; độ dài cạnh của hình vẫn là ${d} cm.` : `Hình triển khai theo tỉ lệ các số đo: dài ${d} cm, rộng ${r} cm, cao ${h} cm.`}</p>
      </>}
    </div>}
    {topic === 'dimensions' && <DimensionControls values={values} onChange={setDimension} />}
    {topic === 'area' && <>
      <ChoiceButtons options={[[ 'lateral', 'Xung quanh' ], [ 'total', 'Toàn phần' ]]} value={area} onChange={setArea} />
      <h3>Diện tích {lateral ? 'xung quanh' : 'toàn phần'}</h3>
      <p>{lateral ? 'Cộng diện tích của bốn mặt bên màu hồng.' : 'Cộng diện tích của cả sáu mặt đang được tô màu.'}</p>
      <div className="formula"><strong>{formula}</strong><span>{substitution} =</span><b>{lateral ? results.lateralArea : results.totalArea} cm²</b></div>
      <p className="muted">{cube ? `a là độ dài cạnh (${d} cm).` : `d: dài ${d} cm; r: rộng ${r} cm; h: cao ${h} cm.`} {lateral ? 'Sxq' : 'Stp'} là diện tích {lateral ? 'xung quanh' : 'toàn phần'}.</p>
    </>}
    {topic === 'volume' && <>
      <h3>Bên trong hình có gì?</h3><p>Thể tích cho biết hình chiếm bao nhiêu chỗ trong không gian. Mỗi khối nhỏ cạnh 1 cm có thể tích 1 cm³.</p>
      <div className="formula"><strong>{cube ? 'V = a × a × a' : 'V = d × r × h'}</strong><span>{d} × {r} × {h} =</span><b>{results.volume} cm³</b></div>
      <p className="muted">V là thể tích. {cube ? `a: cạnh ${d} cm.` : `d: dài ${d} cm; r: rộng ${r} cm; h: cao ${h} cm.`}</p>
      <label className="toggle"><input type="checkbox" checked={units && canShowUnitCubes(dimensions)} disabled={!canShowUnitCubes(dimensions)} onChange={event => setUnits(event.target.checked)} /> Xếp các khối đơn vị 1 cm³</label>
      {!canShowUnitCubes(dimensions) && <p className="note">Em hãy giảm kích thước để thể tích không quá {MAX_UNIT_CUBES} cm³ rồi bật minh họa.</p>}
      {units && canShowUnitCubes(dimensions) && <p className="note">Có {results.volume} khối đơn vị. Khe nhỏ chỉ để nhìn rõ từng khối.</p>}
    </>}
    {topic === 'exercises' && <ExercisePanel state={exerciseState} />}
  </div>;
}
