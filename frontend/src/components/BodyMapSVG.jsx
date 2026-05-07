const bodyParts = [
  { id: 'head', cx: 150, cy: 45, rx: 25, ry: 30 },
  { id: 'neck', cx: 150, cy: 85, rx: 12, ry: 8 },
  { id: 'left_shoulder', cx: 110, cy: 100, rx: 14, ry: 10 },
  { id: 'right_shoulder', cx: 190, cy: 100, rx: 14, ry: 10 },
  { id: 'left_arm', cx: 95, cy: 140, rx: 10, ry: 30 },
  { id: 'right_arm', cx: 205, cy: 140, rx: 10, ry: 30 },
  { id: 'left_hand', cx: 85, cy: 195, rx: 8, ry: 12 },
  { id: 'right_hand', cx: 215, cy: 195, rx: 8, ry: 12 },
  { id: 'chest', cx: 150, cy: 125, rx: 25, ry: 15 },
  { id: 'abdomen', cx: 150, cy: 165, rx: 22, ry: 20 },
  { id: 'left_hip', cx: 120, cy: 200, rx: 14, ry: 10 },
  { id: 'right_hip', cx: 180, cy: 200, rx: 14, ry: 10 },
  { id: 'left_thigh', cx: 115, cy: 245, rx: 12, ry: 30 },
  { id: 'right_thigh', cx: 185, cy: 245, rx: 12, ry: 30 },
  { id: 'left_knee', cx: 110, cy: 290, rx: 10, ry: 8 },
  { id: 'right_knee', cx: 190, cy: 290, rx: 10, ry: 8 },
  { id: 'left_shin', cx: 108, cy: 330, rx: 8, ry: 25 },
  { id: 'right_shin', cx: 192, cy: 330, rx: 8, ry: 25 },
  { id: 'left_ankle', cx: 105, cy: 368, rx: 6, ry: 8 },
  { id: 'right_ankle', cx: 195, cy: 368, rx: 6, ry: 8 },
  { id: 'left_foot', cx: 98, cy: 385, rx: 14, ry: 6 },
  { id: 'right_foot', cx: 202, cy: 385, rx: 14, ry: 6 },
]

export default function BodyMapSVG({ onSelect, selectedPart }) {
  return (
    <svg viewBox="0 0 300 410" className="w-48 md:w-56" xmlns="http://www.w3.org/2000/svg">
      <text x="150" y="15" textAnchor="middle" className="fill-gray-500 text-xs" fontSize="10">FRONT</text>
      {bodyParts.map((p) => (
        <ellipse
          key={p.id}
          cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry}
          className={`cursor-pointer transition-all duration-150 ${
            selectedPart === p.id
              ? 'fill-red-500 stroke-red-700'
              : 'fill-sky-200 stroke-sky-400 hover:fill-sky-300'
          }`}
          strokeWidth="1.5"
          onClick={() => onSelect(p.id)}
        />
      ))}
      {/* Labels */}
      {bodyParts.slice(0, 5).map((p) => (
        <text key={`l-${p.id}`} x={p.cx} y={p.cy + 3} textAnchor="middle" className="fill-white pointer-events-none select-none" fontSize="7">{p.id.split('_').pop()}</text>
      ))}
    </svg>
  )
}
