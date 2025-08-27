import "./search.scss";

interface SearchProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  width?: string;
}

export default function Search({
  value,
  onChange,
  placeholder = "Search...",
  width = "100%",
}: SearchProps) {
  return (
    <div className="search-container">
      <input
        name="custom-search"
        className="custom-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        width={width}
        autoComplete="off"
      />
      <span className="search-icon">
        <img
          src="/assets/icons/search-icon.svg"
          alt="search-icon"
          width={"16px"}
          height={"16px"}
        />
      </span>
    </div>
  );
}
