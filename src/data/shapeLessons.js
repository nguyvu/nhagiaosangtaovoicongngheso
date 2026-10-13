export const shapeLessons = {
  cube: { name: 'Hình lập phương', tone: 'yellow', description: 'Những mặt vuông bằng nhau', faces: '6 mặt đều là hình vuông bằng nhau.', defaults: { a: 3 }, topicLabels: { net: 'Trải hình thành 6 mặt hình vuông' } },
  cuboid: { name: 'Hình hộp chữ nhật', tone: 'green', description: 'Khám phá dài, rộng và cao', faces: '6 mặt là hình chữ nhật; các mặt đối diện bằng nhau.', defaults: { d: 5, r: 3, h: 2 }, topicLabels: { net: 'Trải hình thành 6 mặt hình chữ nhật' } },
  cylinder: { name: 'Hình trụ', tone: 'pink', description: 'Hai đáy tròn và một mặt cong', defaults: { radius: 2, h: 4 },
    topics: ['features', 'net', 'dimensions', 'exercises'],
    topicLabels: { features: 'Đặc điểm hình trụ', net: 'Trải mặt hình trụ' } },
};
export const topics = [
  { id: 'features', label: 'Đỉnh, cạnh và mặt', icon: '◇' },
  { id: 'net', label: 'Trải mặt', icon: '▦' },
  { id: 'dimensions', label: 'Kích thước', icon: '↔' },
  { id: 'area', label: 'Diện tích', icon: '▧' },
  { id: 'volume', label: 'Thể tích', icon: '▦' },
  { id: 'exercises', label: 'Bài tập', icon: '✎' },
];

export function getShapeTopics(shape) {
  const allowed = shapeLessons[shape].topics;
  return allowed ? topics.filter(topic => allowed.includes(topic.id)) : topics;
}
