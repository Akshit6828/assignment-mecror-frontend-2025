import { useEffect, useMemo, useRef, useState } from "react";
import "./dropdown.scss";

export interface DropdownOption {
  label: any;
  value: any;
}
export interface DropdownProps {
  options: DropdownOption[];
  value: DropdownOption;
  onChange: (item: DropdownOption) => void;
  placeholder?: string;
  width?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select",
}: DropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState(value);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event: any) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
      setSearch("");
    }
  };

  const onDropdownOptionClick = (selected: DropdownOption) => {
    setIsDropdownOpen(!isDropdownOpen);
    onChange(selected);
    setDropdownValue(selected);
  };

  const onDropdownInputChange = (e: any) => {
    const searchText = e.target.value;
    setSearch(searchText);
  };

  const onClearBtnClicked = () => {
    onChange({ label: "", value: "" });
    setDropdownValue({ label: "", value: "" });
    setSearch("");
    setIsDropdownOpen(false);
  };

  const dropdownOptions = useMemo(() => {
    if (search) {
      return options.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      );
    }

    return options;
  }, [search, options]);

  const dropdownValueText = useMemo(() => {
    return searchRef.current === document.activeElement
      ? search
      : dropdownValue?.label || "";
  }, [search, dropdownValue, searchRef.current, document.activeElement]);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <input
        name="dropdown-input"
        type="text"
        width={"100%"}
        placeholder={placeholder}
        value={dropdownValueText}
        className={`dropdown-input`}
        onChange={onDropdownInputChange}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        ref={searchRef}
        autoComplete="off"
      />

      <img
        width={8}
        height={8}
        src="assets/icons/arrow-down.svg"
        aria-label="dropdown-arrow"
        alt="arrow"
        className={`dropdown-arrow ${
          isDropdownOpen ? "arrow-up" : "arrow-down"
        }`}
      />

      {isDropdownOpen && (
        <>
          <div className="options-wrapper">
            {dropdownOptions.map((item: DropdownOption) => {
              return (
                <div
                  key={item?.value}
                  className={`dropdown-item ${
                    item?.value === dropdownValue?.value ? "active" : ""
                  }`}
                  onClick={() => onDropdownOptionClick(item)}
                >
                  {item?.label || ""}
                </div>
              );
            })}
            <button className="clear-button" onClick={onClearBtnClicked}>
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  );
}
