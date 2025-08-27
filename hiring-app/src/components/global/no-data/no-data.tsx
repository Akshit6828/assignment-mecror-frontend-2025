import "./no-data.scss";

export default function NoData() {
  return (
    <div className="no-data-container">
      <img
        src="assets/icons/no-data.svg"
        height={"250px"}
        width={"250px"}
        alt="no-data-image"
        aria-label="no-data-image"
      />
      <span className="np-data-text">Opps! No Data Found</span>
    </div>
  );
}
