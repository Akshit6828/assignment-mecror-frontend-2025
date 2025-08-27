import "./no-internet.scss";

export default function NoInternet(props: any) {
  return (
    <div className="no-internet-container">
      <h3 className="ni-data-text">{props.warningMessage}</h3>
    </div>
  );
}
