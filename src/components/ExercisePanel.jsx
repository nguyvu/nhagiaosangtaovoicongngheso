export default function ExercisePanel({ state }) {
  const { exercise, index, total, answer, feedback, showSolution, changeAnswer, check, reveal, next, reset } = state;
  return <div className="exercise-panel">
    <span className="eyebrow">THỬ SỨC · BÀI {index + 1}/{total}</span>
    <h3>{exercise.question}</h3><p className="muted">Dùng số liệu trong đề bài này.</p>
    <form onSubmit={event => { event.preventDefault(); check(); }}>
      <label htmlFor="answer">Đáp án của em ({exercise.unit})</label>
      <input id="answer" inputMode="decimal" autoComplete="off" value={answer} onChange={event => changeAnswer(event.target.value)} placeholder="Nhập một số…" />
      <button className="primary" type="submit">Kiểm tra đáp án</button>
    </form>
    <div aria-live="polite">{feedback && <p className={`feedback ${feedback}`}>
      {feedback === 'correct' ? '✓ Chính xác! Em làm tốt lắm.' : feedback === 'invalid' ? 'Hãy nhập một số hợp lệ nhé.' : '↻ Chưa đúng rồi. Em thử tính lại nhé!'}
    </p>}</div>
    {showSolution ? <div className="solution"><strong>Cùng xem lời giải</strong><p>{exercise.solution}</p></div> : <button className="text-button" onClick={reveal}>Xem đáp án</button>}
    <div className="button-row"><button onClick={reset}>Làm lại</button><button onClick={next}>Bài tiếp theo →</button></div>
  </div>;
}
