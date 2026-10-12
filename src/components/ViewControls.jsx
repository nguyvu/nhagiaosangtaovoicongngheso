import UiIcon from './UiIcon';

export default function ViewControls({ onAction }) {
  return <div className="view-controls" aria-label="Điều khiển góc nhìn">
    <button type="button" onClick={() => onAction('left')} aria-label="Xoay sang trái" title="Xoay sang trái"><UiIcon name="left" /><span className="view-control-label">Xoay trái</span></button>
    <button type="button" onClick={() => onAction('right')} aria-label="Xoay sang phải" title="Xoay sang phải"><UiIcon name="right" /><span className="view-control-label">Xoay phải</span></button>
    <button type="button" onClick={() => onAction('in')} aria-label="Phóng to" title="Phóng to"><UiIcon name="in" /><span className="view-control-label">Phóng to</span></button>
    <button type="button" onClick={() => onAction('out')} aria-label="Thu nhỏ" title="Thu nhỏ"><UiIcon name="out" /><span className="view-control-label">Thu nhỏ</span></button>
    <button type="button" className="reset-view" onClick={() => onAction('reset')}><UiIcon name="reset" /><span className="view-control-label">Góc nhìn ban đầu</span></button>
  </div>;
}
