export const exercises = {
  cube: [
    { id: 'cube-vertices', question: 'Hình lập phương có bao nhiêu đỉnh?', answer: 8, unit: 'đỉnh', solution: 'Mỗi mặt đáy có 4 đỉnh. Hai mặt đáy có 4 + 4 = 8 đỉnh.' },
    { id: 'cube-lateral', question: 'Hình lập phương có cạnh 3 cm. Diện tích xung quanh là bao nhiêu?', answer: 36, unit: 'cm²', solution: 'Sxq = 4 × 3 × 3 = 36 cm².' },
    { id: 'cube-total', question: 'Hình lập phương có cạnh 2 cm. Diện tích toàn phần là bao nhiêu?', answer: 24, unit: 'cm²', solution: 'Stp = 6 × 2 × 2 = 24 cm².' },
    { id: 'cube-volume', question: 'Hình lập phương có cạnh 3 cm. Thể tích là bao nhiêu?', answer: 27, unit: 'cm³', solution: 'V = 3 × 3 × 3 = 27 cm³.' },
  ],
  cuboid: [
    { id: 'cuboid-edges', question: 'Hình hộp chữ nhật có bao nhiêu cạnh?', answer: 12, unit: 'cạnh', solution: 'Mỗi mặt đáy có 4 cạnh, thêm 4 cạnh nối hai đáy: 4 + 4 + 4 = 12 cạnh.' },
    { id: 'cuboid-lateral', question: 'Hình hộp chữ nhật dài 5 cm, rộng 3 cm, cao 2 cm. Tính diện tích xung quanh.', answer: 32, unit: 'cm²', solution: 'Sxq = 2 × (5 + 3) × 2 = 32 cm².' },
    { id: 'cuboid-total', question: 'Hình hộp chữ nhật dài 5 cm, rộng 3 cm, cao 2 cm. Tính diện tích toàn phần.', answer: 62, unit: 'cm²', solution: 'Stp = 2 × (5 × 3 + 5 × 2 + 3 × 2) = 62 cm².' },
    { id: 'cuboid-volume', question: 'Hình hộp chữ nhật dài 5 cm, rộng 3 cm, cao 2 cm. Tính thể tích.', answer: 30, unit: 'cm³', solution: 'V = 5 × 3 × 2 = 30 cm³.' },
  ],
  cylinder: [
    { id: 'cylinder-bases', question: 'Hình trụ có bao nhiêu mặt đáy tròn?', answer: 2, unit: 'mặt đáy', solution: 'Hình trụ có hai mặt đáy tròn bằng nhau, ở trên và dưới.' },
    { id: 'cylinder-curved', question: 'Hình trụ có bao nhiêu mặt xung quanh cong?', answer: 1, unit: 'mặt cong', solution: 'Hình trụ có một mặt xung quanh cong nối hai đáy tròn.' },
    { id: 'cylinder-vertices', question: 'Hình trụ có bao nhiêu đỉnh nhọn?', answer: 0, unit: 'đỉnh', solution: 'Hình trụ không có đỉnh nhọn như hình lập phương hay hình hộp chữ nhật.' },
    { id: 'cylinder-net', question: 'Khi trải mặt xung quanh của hình trụ, em được bao nhiêu hình chữ nhật?', answer: 1, unit: 'hình chữ nhật', solution: 'Mặt xung quanh trải thành một hình chữ nhật. Hai đáy vẫn là hai hình tròn bằng nhau.' },
  ],
};
