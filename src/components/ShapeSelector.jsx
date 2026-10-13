import { shapeLessons } from '../data/shapeLessons';
import ShapeIcon from './ShapeIcon';

export default function ShapeSelector({ shape, onSelect }) {
  return <section aria-labelledby="shape-heading" className="shape-section">
    <div className="section-heading"><span className="step">01</span><h2 id="shape-heading">Chọn hình em muốn khám phá</h2></div>
    <div className="shape-options">{Object.entries(shapeLessons).map(([id, lesson]) =>
      <button key={id} data-tone={lesson.tone} className={`shape-card ${shape === id ? 'selected' : ''}`} aria-pressed={shape === id} onClick={() => onSelect(id)}>
        <ShapeIcon wide={id === 'cuboid'} cylinder={id === 'cylinder'} /><span><strong>{lesson.name}</strong><small>{lesson.description}</small></span>
        <span className="selection-mark" aria-hidden="true">{shape === id ? '✓' : '+'}</span>
      </button>)}</div>
  </section>;
}
