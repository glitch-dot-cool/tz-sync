import { memo, useCallback } from "react";
import { defaultEntry, Entry, Modes, STORAGE_KEY } from "./App";

interface ControlsProps {
  mode: Modes;
  setMode: React.Dispatch<React.SetStateAction<Modes>>;
  setEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
  entries: Entry[];
}

function encodeState(data: Entry[]) {
  return encodeURIComponent(btoa(JSON.stringify(data)));
}

function shareUrl(entries: Entry[]) {
  const data = encodeState(entries);
  const url = `${location.origin}${location.pathname}?data=${data}`;
  navigator.clipboard.writeText(url);
  return url;
}

export const Controls = memo(
  ({ mode, setMode, entries, setEntries }: ControlsProps) => {
    const sortEntries = useCallback(() => {
      setEntries((entries) =>
        entries.sort((a, b) => {
          return a.offsetInMinutes - b.offsetInMinutes;
        })
      );
    }, [entries, setEntries]);

    const addEntry = useCallback(() => {
      setEntries((e) => [
        ...e,
        {
          id: Date.now().toString(36),
          tz: "UTC",
          label: "",
          query: "",
          offsetInMinutes: 0,
        },
      ]);
    }, [setEntries]);

    if (mode === "edit") {
      return (
        <div className="controls">
          <button onClick={addEntry}>Add</button>
          <button onClick={sortEntries}>Sort</button>
          <button
            onClick={() => {
              const url = shareUrl(entries);
              alert("Copied share URL to clipboard:\n" + url);
            }}
          >
            Share
          </button>
          <button onClick={() => setMode("view")}>View Mode</button>
          <button
            className="destructive"
            onClick={() => {
              if (confirm("are you sure you want to reset all entries?")) {
                localStorage.removeItem(STORAGE_KEY);
                setEntries([defaultEntry()]);
              }
            }}
          >
            Reset
          </button>
        </div>
      );
    }

    if (mode === "view") {
      return (
        <div className="controls">
          <button
            onClick={() => {
              const url = shareUrl(entries);
              alert("Copied share URL to clipboard:\n" + url);
            }}
          >
            Share
          </button>
          <button onClick={() => setMode("edit")}>Edit Mode</button>
        </div>
      );
    }
  }
);
