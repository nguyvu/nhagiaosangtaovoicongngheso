import ChoiceButtons from './ChoiceButtons';
import DimensionControls from './DimensionControls';
import ExercisePanel from './ExercisePanel';
import { cylinderFeatures } from '../data/cylinderLessons';

export default function CylinderKnowledge({ topic, feature, setFeature, netOpen, geometry, exerciseState }) {
  const { values, dimensions: { radius, h }, setDimension } = geometry;
  const selectedFeature = cylinderFeatures[feature];
  return <>
    {!topic && <div className="empty-panel"><h3>Cùng khám phá hai đáy tròn!</h3><p>Chọn một mục ở trên để tìm hiểu hình trụ. Em có thể bấm lần nữa để đóng nội dung.</p></div>}
    {topic === 'features' && <>
      <ChoiceButtons options={Object.entries(cylinderFeatures).map(([id, item]) => [id, item.label])} value={feature} onChange={setFeature} />
      <div className="fact-number">{selectedFeature.count} <span>{selectedFeature.unit}</span></div>
      <p>{selectedFeature.text}</p>
    </>}
    {topic === 'dimensions' && <>
      <DimensionControls values={values} onChange={setDimension} />
      <p className="note">Bán kính là đoạn nối tâm đến đường tròn đáy. Đường kính bằng hai lần bán kính.</p>
    </>}
    {topic === 'net' && <div className="net-lesson">
      <h3>Trải hình trụ</h3>
      <p>Mặt xung quanh trải thành một hình chữ nhật. Hai mặt đáy là hai hình tròn bằng nhau. Bấm “Ghép thành khối” ở trên để ghép lại.</p>
      {netOpen && <>
        <p className="net-legend"><span><i className="net-swatch side" /> Hình số 1: mặt xung quanh</span><span><i className="net-swatch base" /> Hình số 2–3: hai đáy tròn</span></p>
        <p>Hình số 1 cuộn lại thành mặt cong. Hình số 2 và 3 đậy hai đầu để tạo thành hình trụ.</p>
        <p className="muted">Hình trụ đang có bán kính {radius} cm, chiều cao {h} cm. Trải và ghép không thay đổi các số đo này.</p>
      </>}
    </div>}
    {topic === 'exercises' && <ExercisePanel state={exerciseState} />}
  </>;
}
