import "./loader.scss";
export default function Loader() {
  return (
    <div className="loading-container">
      <img
        className="loader-icon"
        src="assets/icons/loader-icon.svg"
        width={"64px"}
        height={"64px"}
        alt="loader-icon"
        aria-label="loader-icon"
      />
    </div>
  );
}
