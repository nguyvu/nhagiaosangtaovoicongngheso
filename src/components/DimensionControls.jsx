export default function DimensionControls({ values, onChange }) {
  const labels = { a: 'Độ dài cạnh a', d: 'Chiều dài d', r: 'Chiều rộng r', h: 'Chiều cao h' };
  return <div className="dimension-controls"><p>Kéo thanh trượt để thay đổi kích thước thật của hình.</p>
    {Object.entries(values).map(([key, value]) => <label key={key} className="dimension-row">
      <span>{labels[key]} <strong>{value} cm</strong></span>
      <input type="range" min="1" max="10" step="1" value={value} onChange={event => onChange(key, event.target.value)} />
      <span className="range-labels"><small>1 cm</small><small>10 cm</small></span>
    </label>)}
  </div>;
}
