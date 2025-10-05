import React from "react";
import Select, { components } from "react-select";
import type { SearchableZone } from "./App";

type Option = {
  value: string;
  label: string;
  offsetInMinutes?: number;
  city?: string;
  zoneName?: string;
  display?: string;
};

interface TimezoneSelectProps {
  value?: string;
  zones: SearchableZone[];
  onChange: (zoneName: string, offsetInMinutes?: number) => void;
  placeholder?: string;
}

function toOption(z: SearchableZone): Option {
  return {
    value: z.zoneName,
    label: z.display,
    offsetInMinutes: z.offsetInMinutes,
    city: z.city,
    zoneName: z.zoneName,
    display: z.display,
  };
}

export const TimezoneSelect = ({
  value,
  zones,
  onChange,
  placeholder,
}: TimezoneSelectProps) => {
  const options: Option[] = zones.map(toOption);

  const selected = options.find((o) => o.value === value) ?? null;

  const filterOption = (
    candidate: { label: string; value: string; data: Option },
    input: string
  ) => {
    if (!input) return true;
    const q = input.toLowerCase();
    const data = candidate.data;
    return (
      String(data.label || "")
        .toLowerCase()
        .includes(q) ||
      String(data.city || "")
        .toLowerCase()
        .includes(q) ||
      String(data.zoneName || "")
        .toLowerCase()
        .includes(q)
    );
  };

  return (
    <Select
      className="timezone-select"
      options={options}
      value={selected}
      onChange={(opt) => {
        const o = opt as Option | null;
        if (o) onChange(o.value, o.offsetInMinutes);
      }}
      isSearchable
      placeholder={placeholder ?? "Search timezone..."}
      filterOption={(candidate, input) => filterOption(candidate, input || "")}
      components={{ DropdownIndicator: components.DropdownIndicator }}
      unstyled
      styles={{
        control: (base) => ({
          ...base,
          minWidth: 250,
          fontFamily: "Roboto Mono",
          backgroundColor: "#4b4b4b",
          padding: "4px 6px",
          fontSize: "14px",
          minHeight: "none",
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "#4b4b4b",
        }),
        option: (base) => ({
          ...base,
          lineHeight: "24px",
          fontFamily: "Roboto Mono",
          padding: "4px 6px",
        }),
      }}
    />
  );
};
