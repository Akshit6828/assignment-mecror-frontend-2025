import AppLogo from "../global/app-logo/app-logo";
import "./app-header.scss";

export default function AppHeader() {
  return (
    <header className="app-header">
      {/* Top bar */}
      <div className="header-container">
        <div className="header-lhs">
          <AppLogo />
          <div className="header-text">
            <div className="main-text">Hire Wise</div>
            <div className="sub-text">Smart Hiring</div>
          </div>
        </div>

        <div className="header-rhs">
          <button className="avatar-btn">
            <i className="fa-solid fa-user"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
