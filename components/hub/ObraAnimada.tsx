export function ObraAnimada() {
  return (
    <svg className="obra-anim" viewBox="0 0 260 340" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <line className="obra-chao" x1="20" y1="330" x2="240" y2="330" />
      <line className="obra-vedacao" x1="24" y1="330" x2="24" y2="322" />
      <line className="obra-vedacao" x1="34" y1="330" x2="34" y2="322" />
      <line className="obra-vedacao" x1="44" y1="330" x2="44" y2="322" />
      <line className="obra-vedacao" x1="54" y1="330" x2="54" y2="322" />
      <line className="obra-vedacao" x1="206" y1="330" x2="206" y2="322" />
      <line className="obra-vedacao" x1="216" y1="330" x2="216" y2="322" />
      <line className="obra-vedacao" x1="226" y1="330" x2="226" y2="322" />
      <line className="obra-vedacao" x1="236" y1="330" x2="236" y2="322" />

      <g className="obra-grua">
        <path className="obra-base" d="M 180,330 L 182,320 L 210,320 L 212,330 Z" />
        <line x1="189" y1="326" x2="201" y2="326" />
        <line x1="189" y1="326" x2="189" y2="224" />
        <line x1="201" y1="326" x2="201" y2="224" />
        <path d="M 189,326 L 201,312 L 189,298 L 201,284 L 189,270 L 201,256 L 189,242 L 201,228" fill="none" />
        <path className="obra-base" d="M 182,212 L 208,212 L 204,224 L 186,224 Z" />
        <g className="obra-lanca">
          <line x1="201" y1="218" x2="252" y2="221" />
          <line x1="201" y1="224" x2="252" y2="226" />
          <path d="M 205,224 L 216,218 L 227,224 L 238,218 L 249,224" fill="none" />
          <line x1="189" y1="219" x2="152" y2="222" />
          <line x1="189" y1="224" x2="152" y2="226" />
          <path d="M 186,224 L 176,219 L 166,224 L 156,220" fill="none" />
          <rect className="obra-contrapeso" x="146" y="220" width="12" height="10" />
          <line className="obra-cabo" x1="234" y1="222" x2="234" y2="250" />
          <rect className="obra-carga" x="228" y="250" width="12" height="9" />
        </g>
      </g>

      <g className="obra-parte obra-fundacao">
        <rect x="95" y="318" width="70" height="12" />
        <rect x="72" y="322" width="14" height="8" />
        <rect x="88" y="322" width="14" height="8" />
        <rect x="80" y="313" width="14" height="8" />
      </g>

      <g className="obra-parte obra-piso1">
        <rect x="100" y="296" width="60" height="22" />
        <rect className="obra-janela" x="110" y="303" width="9" height="9" />
        <rect className="obra-janela" x="126" y="303" width="9" height="9" />
        <rect className="obra-janela" x="142" y="303" width="9" height="9" />
      </g>

      <g className="obra-parte obra-piso2">
        <rect x="100" y="274" width="60" height="22" />
        <rect className="obra-janela" x="110" y="281" width="9" height="9" />
        <rect className="obra-janela" x="126" y="281" width="9" height="9" />
        <rect className="obra-janela" x="142" y="281" width="9" height="9" />
      </g>

      <g className="obra-parte obra-telhado">
        <path d="M 93,274 L 130,254 L 167,274" />
        <line x1="112" y1="266" x2="122" y2="261" />
        <line x1="120" y1="270.5" x2="130" y2="265.5" />
        <line x1="138" y1="270.5" x2="148" y2="265.5" />
      </g>
    </svg>
  );
}
