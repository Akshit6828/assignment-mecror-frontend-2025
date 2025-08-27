import { useEffect, useMemo, useRef, useState } from "react";
import "./multi-select-dropdown.scss";

export interface DropdownOption {
  label: string;
  value: string;
}

interface MultiSelectDropdownProps {
  options: DropdownOption[];
  values: DropdownOption[]; // multiple selected values
  onChange: (items: DropdownOption[]) => void;
  placeholder?: string;
}

export default function MultiSelectDropdown({
  options,
  values,
  onChange,
  placeholder = "Select",
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      setSearch("");
    }
  };

  const toggleOption = (option: DropdownOption) => {
    const exists = values.find((v) => v.value === option.value);
    let updated: DropdownOption[];
    if (exists) {
      updated = values.filter((v) => v.value !== option.value);
    } else {
      updated = [...values, option];
    }
    onChange(updated);
  };

  const removeChip = (option: DropdownOption) => {
    const updated = values.filter((v) => v.value !== option.value);
    onChange(updated);
  };

  const onClearAll = () => {
    onChange([]);
    setIsOpen(false);
  };

  const filteredOptions = useMemo(() => {
    if (search) {
      return options.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      );
    }
    return options;
  }, [search, options]);

  return (
    <div className="multi-dropdown-container" ref={dropdownRef}>
      {/* Input + Chips */}
      <div
        className={`multi-dropdown-input`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="chips-wrapper">
          {values.length > 0 ? (
            values.map((item) => (
              <div className="chip" key={item.value}>
                {item.label}
                <span
                  className="chip-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChip(item);
                  }}
                >
                  ×
                </span>
              </div>
            ))
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="search-input"
            placeholder={values.length ? "" : placeholder}
          />
        </div>
        <img
          width={8}
          height={8}
          src="assets/icons/arrow-down.svg"
          alt="arrow"
          className={`dropdown-arrow ${isOpen ? "arrow-up" : "arrow-down"}`}
        />
      </div>

      {isOpen && (
        <div className="options-wrapper">
          {filteredOptions.map((item) => {
            const isSelected = values.some((v) => v.value === item.value);
            return (
              <div
                key={item.value}
                className={`dropdown-item ${isSelected ? "active" : ""}`}
                onClick={() => toggleOption(item)}
              >
                {item.label}
              </div>
            );
          })}
          {values.length > 0 && (
            <button className="clear-button" onClick={onClearAll}>
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
}
