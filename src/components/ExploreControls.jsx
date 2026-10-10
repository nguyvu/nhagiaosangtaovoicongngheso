import { topics } from '../data/shapeLessons';

export default function ExploreControls({ topic, onSelect }) {
  return <div className="topic-list" aria-label="Nội dung khám phá">{topics.map(item =>
    <button key={item.id} aria-expanded={topic === item.id} aria-controls="knowledge-content" className={topic === item.id ? 'active' : ''} onClick={() => onSelect(item.id)}>
      <span className="topic-icon" aria-hidden="true">{item.icon}</span>{item.label}<span className="topic-arrow" aria-hidden="true">{topic === item.id ? '−' : '+'}</span>
    </button>)}</div>;
}
