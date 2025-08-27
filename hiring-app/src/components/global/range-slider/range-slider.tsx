import React, { useState, useEffect, type ChangeEvent,  } from "react";
import "./range-slider.scss";

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  initialMin?: number;
  initialMax?: number;
  onChange: (minValue: number, maxValue: number) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  initialMin,
  initialMax,
  onChange,
}) => {
  const [minValue, setMinValue] = useState(initialMin ?? min);
  const [maxValue, setMaxValue] = useState(initialMax ?? max);

  useEffect(() => {
    onChange(minValue, maxValue);
  }, [minValue, maxValue]);

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxValue - step);
    setMinValue(value);
  };

  const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minValue + step);
    setMaxValue(value);
  };

  return (
    <div className="range-slider">
      <div className="slider-track" />
      <div
        className="slider-range"
        style={{
          left: `${((minValue - min) / (max - min)) * 100}%`,
          right: `${100 - ((maxValue - min) / (max - min)) * 100}%`,
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minValue}
        onChange={handleMinChange}
        className="thumb thumb-left"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxValue}
        onChange={handleMaxChange}
        className="thumb thumb-right"
      />
      <div className="values">
        <span>{minValue}</span> - <span>{maxValue}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
