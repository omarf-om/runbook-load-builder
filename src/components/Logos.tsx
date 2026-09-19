export function WalmartLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 40" className={className} role="img" aria-label="Walmart">
      <text
        x="0"
        y="28"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="28"
        fill="#0071ce"
      >
        Walmart
      </text>
      <g transform="translate(148, 4)">
        {Array.from({ length: 6 }).map((_, i) => (
          <rect
            key={i}
            x="-1.5"
            y="-9"
            width="3"
            height="9"
            rx="1.5"
            fill="#ffc220"
            transform={`rotate(${i * 60} 0 0)`}
          />
        ))}
      </g>
    </svg>
  );
}

export function ShvLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 40" className={className} role="img" aria-label="SHV Logistics">
      <text
        x="0"
        y="24"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontStyle="italic"
        fontSize="24"
        fill="#0a2149"
      >
        SHV
      </text>
      <text
        x="0"
        y="36"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="500"
        fontSize="9"
        letterSpacing="2"
        fill="#3a5488"
      >
        LOGISTICS
      </text>
    </svg>
  );
}
