import { topics } from '../data/shapeLessons';
import UiIcon from './UiIcon';

export default function ExploreControls({ topic, onSelect }) {
  return <div className="topic-list" aria-label="Nội dung khám phá">{topics.map(item =>
    <button key={item.id} type="button" aria-expanded={topic === item.id} aria-controls="knowledge-content" className={topic === item.id ? 'active' : ''} onClick={() => onSelect(item.id)}>
      <span className="topic-icon" aria-hidden="true"><UiIcon name={item.id} /></span>
      <span className="topic-label">{item.label}</span>
      <span className="topic-arrow" aria-hidden="true"><UiIcon name={topic === item.id ? 'minus' : 'plus'} /></span>
    </button>)}</div>;
}
