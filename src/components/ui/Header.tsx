export function Header() {
  return (
    <header className="school-header">
      <div className="school-header-inner">
        <h1 className="school-header-title">
          <span className="school-header-logo" aria-hidden>🔢</span>
          <span className="school-header-title-text">
            <span className="school-header-vlsm">VLSM</span> Test
          </span>
          <span className="school-header-divider">—</span>
          <span className="school-header-prof">Prof. Carello Nicolò</span>
        </h1>
        <div className="school-header-subtitle">
          ITIS G. Marconi · Verona · Sistemi e Reti (SRI) · A.S. 2025/2026
        </div>
      </div>
    </header>
  );
}
