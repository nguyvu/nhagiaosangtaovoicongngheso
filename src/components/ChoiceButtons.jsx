export default function ChoiceButtons({ options, value, onChange }) {
  return <div className="choice-buttons">{options.map(([id, label]) => <button key={id} aria-pressed={value === id} className={value === id ? 'active' : ''} onClick={() => onChange(id)}>{label}</button>)}</div>;
}
