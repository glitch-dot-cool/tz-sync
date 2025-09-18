import React, { useEffect, useState, useRef } from "react";
import { DateTime } from "luxon";

const STORAGE_KEY = "timezones:data";

function defaultEntry() {
  return {
    id: Date.now().toString(36),
    tz: DateTime.local().zoneName,
    label: "Local",
  };
}

function encodeState(data) {
  return encodeURIComponent(btoa(JSON.stringify(data)));
}

function decodeState(s) {
  try {
    return JSON.parse(atob(decodeURIComponent(s)));
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default function App() {
  const [entries, setEntries] = useState(() => {
    // try loading from URL first
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    if (data) {
      const decoded = decodeState(data);
      if (decoded && Array.isArray(decoded)) return decoded;
    }

    // fallback to localStorage if no data found in URL
    try {
      const cachedData = localStorage.getItem(STORAGE_KEY);
      if (cachedData) return JSON.parse(cachedData);
    } catch (e) {}
    return [defaultEntry()];
  });

  const [now, setNow] = useState(Date.now());
  const saveTimer = useRef(null);

  // realtime clock
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // autosave to localStorage (debounced)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }, 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [entries]);

  function addEntry() {
    setEntries((e) => [
      ...e,
      { id: Date.now().toString(36), tz: "UTC", label: "New" },
    ]);
  }

  function updateEntry(id, patch) {
    setEntries((e) => e.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function removeEntry(id) {
    setEntries((e) => e.filter((x) => x.id !== id));
  }

  function shareUrl() {
    const data = encodeState(entries);
    const url = `${location.origin}${location.pathname}?data=${data}`;
    navigator.clipboard?.writeText(url);
    return url;
  }

  return (
    <div className="app">
      <header>
        <h1>Timezones</h1>
        <div className="controls">
          <button onClick={addEntry}>Add timezone</button>
          <button
            onClick={() => {
              const url = shareUrl();
              alert("Copied share URL to clipboard:\n" + url);
            }}
          >
            Share
          </button>
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setEntries([defaultEntry()]);
            }}
          >
            Reset
          </button>
        </div>
      </header>

      <main>
        <div className="columns">
          {entries.map((entry) => (
            <div className="card" key={entry.id}>
              <div className="card-header">
                <input
                  value={entry.label}
                  onChange={(e) =>
                    updateEntry(entry.id, { label: e.target.value })
                  }
                />
                <select
                  value={entry.tz}
                  onChange={(e) =>
                    updateEntry(entry.id, { tz: e.target.value })
                  }
                >
                  {Intl.supportedValuesOf &&
                    Intl.supportedValuesOf("timeZone").map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  {!Intl.supportedValuesOf && (
                    <option value={entry.tz}>{entry.tz}</option>
                  )}
                </select>
              </div>
              <div className="card-body">
                <div className="time">
                  {DateTime.fromMillis(now)
                    .setZone(entry.tz)
                    .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}
                </div>
                <div className="tz-info">{entry.tz}</div>
              </div>
              <div className="card-footer">
                <button onClick={() => removeEntry(entry.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer>
        <small>
          Local changes autosave to localStorage. Sharing encodes data in the
          URL.
        </small>
      </footer>
    </div>
  );
}
