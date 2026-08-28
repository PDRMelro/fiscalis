export function ObraAnimada() {
  return (
    <svg className="obra-anim" viewBox="0 0 260 340" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <line className="obra-chao" x1="20" y1="300" x2="240" y2="300" />

      <g className="obra-grua">
        <rect x="184" y="297" width="22" height="6" />
        <line x1="195" y1="300" x2="195" y2="50" />
        <g className="obra-lanca">
          <line x1="195" y1="50" x2="250" y2="55" />
          <line x1="195" y1="50" x2="175" y2="55" />
          <line x1="236" y1="53.5" x2="236" y2="92" />
          <line x1="232" y1="92" x2="240" y2="92" />
        </g>
      </g>

      <rect className="obra-parte obra-fundacao" x="95" y="290" width="70" height="12" />
      <rect className="obra-parte obra-piso1" x="100" y="250" width="60" height="40" />
      <rect className="obra-parte obra-piso2" x="100" y="210" width="60" height="40" />
      <rect className="obra-parte obra-piso3" x="100" y="170" width="60" height="40" />
      <rect className="obra-parte obra-piso4" x="100" y="130" width="60" height="40" />
      <path className="obra-parte obra-telhado" d="M 93,130 L 130,112 L 167,130" />
    </svg>
  );
}
