"use client";

import { useState } from "react";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";

interface RadioButtons {
  entries: Record<string, string>;
  value?: string;
  onChange?: Function;
}

export default function RadioButtons({
  entries,
  value,
  onChange,
}: RadioButtons) {
  return (
    <>
      {Object.keys(entries).map((key, i) => (
        <label key={i} className="flex items-center gap-2">
          <button
            className={`hover:text-primary ${key === value && "text-primary"}`}
            onClick={() => onChange && onChange(key)}
          >
            {key === value ? (
              <MdRadioButtonChecked />
            ) : (
              <MdRadioButtonUnchecked />
            )}
          </button>
          {entries[key]}
        </label>
      ))}
    </>
  );
}
