export function ObraAnimada() {
  return (
    <svg className="obra-anim" viewBox="0 0 260 340" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <line className="obra-chao" x1="20" y1="330" x2="240" y2="330" />

      <g className="obra-grua">
        <rect x="184" y="327" width="22" height="6" />
        <line x1="195" y1="330" x2="195" y2="90" />
        <g className="obra-lanca">
          <line x1="195" y1="90" x2="250" y2="95" />
          <line x1="195" y1="90" x2="175" y2="95" />
          <line x1="236" y1="93.5" x2="236" y2="128" />
          <line x1="232" y1="128" x2="240" y2="128" />
        </g>
      </g>

      <rect className="obra-parte obra-fundacao" x="95" y="316" width="70" height="12" />
      <rect className="obra-parte obra-piso1" x="100" y="294" width="60" height="22" />
      <rect className="obra-parte obra-piso2" x="100" y="272" width="60" height="22" />
      <rect className="obra-parte obra-piso3" x="100" y="250" width="60" height="22" />
      <path className="obra-parte obra-telhado" d="M 93,250 L 130,232 L 167,250" />
    </svg>
  );
}
