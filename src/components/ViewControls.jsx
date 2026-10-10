export default function ViewControls({ onAction }) {
  return <div className="view-controls" aria-label="Điều khiển góc nhìn">
    <button onClick={() => onAction('left')} aria-label="Xoay sang trái" title="Xoay sang trái">↶</button>
    <button onClick={() => onAction('right')} aria-label="Xoay sang phải" title="Xoay sang phải">↷</button>
    <span className="control-divider" />
    <button onClick={() => onAction('in')} aria-label="Phóng to" title="Phóng to">+</button>
    <button onClick={() => onAction('out')} aria-label="Thu nhỏ" title="Thu nhỏ">−</button>
    <button className="reset-view" onClick={() => onAction('reset')}>↺ <span>Góc nhìn ban đầu</span></button>
  </div>;
}
