import { useState } from 'react';
import { exercises } from '../data/exercises';
import { isCorrectAnswer, parseAnswer } from '../utils/answerValidation';

export function useExercises(shape) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const list = exercises[shape];
  const exercise = list[index];
  function changeAnswer(value) { setAnswer(value); setFeedback(null); }
  function check() {
    if (parseAnswer(answer) === null) { setFeedback('invalid'); return; }
    setFeedback(isCorrectAnswer(answer, exercise.answer) ? 'correct' : 'incorrect');
  }
  function reset(nextIndex = index) {
    setIndex(nextIndex); setAnswer(''); setFeedback(null); setShowSolution(false);
  }
  return { exercise, index, total: list.length, answer, feedback, showSolution,
    changeAnswer, check, reveal: () => setShowSolution(true),
    next: () => reset((index + 1) % list.length), reset: () => reset() };
}
