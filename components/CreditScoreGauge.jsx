'use client';
// components/CreditScoreGauge.jsx
// Renders a CIBIL-style arc gauge for the driver's Freight Credit Score

export default function CreditScoreGauge({ score = 0, max = 900 }) {
  const pct = Math.min(1, score / max);
  // Arc: 251px circumference for a 80r semicircle spanning 270 degrees
  const arcLength = 251;
  const filled = pct * arcLength;

  const color =
    score < 400 ? '#E24B4A' :
    score < 600 ? '#EF9F27' :
    score < 750 ? '#185FA5' :
                  '#3B6D11';

  const label =
    score < 400 ? 'Poor' :
    score < 600 ? 'Fair' :
    score < 750 ? 'Good' :
                  'Excellent';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 130" className="w-full max-w-[200px]">
        {/* Background arc */}
        <path d="M 20 110 A 80 80 0 1 1 180 110"
          fill="none" stroke="#e5e7eb" strokeWidth="16" strokeLinecap="round" />
        {/* Score arc */}
        <path d="M 20 110 A 80 80 0 1 1 180 110"
          fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"
          strokeDasharray={`${filled} ${arcLength}`} />
        {/* Score number */}
        <text x="100" y="96" textAnchor="middle" fontSize="28" fontWeight="600" fill="#111">
          {score}
        </text>
        <text x="100" y="116" textAnchor="middle" fontSize="11" fill="#6b7280">
          out of {max}
        </text>
      </svg>
      <div className="flex justify-between w-full px-2 text-[10px] text-gray-400 mt-1">
        <span>Poor</span>
        <span style={{ color, fontWeight: 600 }}>{label}</span>
        <span>Max</span>
      </div>
    </div>
  );
}
