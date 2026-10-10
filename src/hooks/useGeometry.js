import { useState } from 'react';
import { shapeLessons } from '../data/shapeLessons';
import { calculateGeometry, clampDimension, getDimensions } from '../utils/geometry';

export function useGeometry(shape) {
  const [values, setValues] = useState(() => ({ ...shapeLessons[shape].defaults }));
  const dimensions = getDimensions(shape, values);
  function setDimension(key, value) {
    setValues(previous => ({ ...previous, [key]: clampDimension(value) }));
  }
  return { values, dimensions, results: calculateGeometry(dimensions), setDimension };
}
