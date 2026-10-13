import { getShapeTopics, shapeLessons } from '../data/shapeLessons';
import UiIcon from './UiIcon';

export default function ExploreControls({ shape, topic, netOpen, netClosing, onSelect }) {
  return <div className="topic-list" aria-label="Nội dung khám phá">{getShapeTopics(shape).map((item, index) =>
    <button key={item.id} data-tone={index % 2 === 0 ? 'yellow' : 'green'} type="button" aria-disabled={item.id === 'net' && netClosing} aria-expanded={topic === item.id} aria-controls="knowledge-content" className={topic === item.id ? 'active' : ''} onClick={() => onSelect(item.id)}>
      <span className="topic-icon" aria-hidden="true"><UiIcon name={item.id} /></span>
      <span className="topic-label">{item.id === 'net' && netOpen ? 'Ghép thành khối' : shapeLessons[shape].topicLabels?.[item.id] || item.label}</span>
      <span className="topic-arrow" aria-hidden="true"><UiIcon name={topic === item.id ? 'minus' : 'plus'} /></span>
    </button>)}</div>;
}
