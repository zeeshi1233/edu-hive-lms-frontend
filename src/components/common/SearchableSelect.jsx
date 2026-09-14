import React from "react";
import Select from "react-select";

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  isMulti = false,
  isDark = false,
  isClearable = true,
}) => {
  const inputBg = isDark ? "#0F172A" : "#FFFFFF";
  const inputBorder = isDark ? "#334155" : "#E2E8F0";
  const inputColor = isDark ? "#E2E8F0" : "#111827";

  return (
    <Select
      isMulti={isMulti}
      isSearchable
      isClearable={isClearable}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      classNamePrefix="lms-select"
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: inputBg,
          borderColor: state.isFocused ? "#FEBA01" : inputBorder,
          boxShadow: state.isFocused ? "0 0 0 3px rgba(254, 186, 1, 0.18)" : "none",
          minHeight: "46px",
          borderRadius: "10px",
          color: inputColor,
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: inputBg,
          zIndex: 9999,
          borderRadius: "10px",
          overflow: "hidden",
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? "#FEBA01" : inputBg,
          color: state.isFocused ? "#111" : inputColor,
          cursor: "pointer",
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "#FEBA01",
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "#000",
          fontWeight: 600,
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: "#000",
          ":hover": {
            backgroundColor: "#111",
            color: "#fff",
          },
        }),
        singleValue: (base) => ({
          ...base,
          color: inputColor,
        }),
        input: (base) => ({
          ...base,
          color: inputColor,
        }),
        placeholder: (base) => ({
          ...base,
          color: isDark ? "#94A3B8" : "#94A3B8",
        }),
      }}
    />
  );
};

export default SearchableSelect;
