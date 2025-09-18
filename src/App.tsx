import React, { useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";

type Entry = {
  id: string;
  tz: string;
  label: string;
};

const STORAGE_KEY = "timezones:data";

function defaultEntry(): Entry {
  return {
    id: Date.now().toString(36),
    tz: DateTime.local().zoneName,
    label: "Local",
  };
}

function encodeState(data: Entry[]) {
  return encodeURIComponent(btoa(JSON.stringify(data)));
}

function decodeState(s: string) {
  try {
    return JSON.parse(atob(decodeURIComponent(s))) as Entry[];
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default function App(): JSX.Element {
  const [entries, setEntries] = useState<Entry[]>(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    if (data) {
      const decoded = decodeState(data);
      if (decoded && Array.isArray(decoded)) return decoded;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Entry[];
    } catch (e) {}
    return [defaultEntry()];
  });

  const [now, setNow] = useState<number>(Date.now());
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }, 250);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [entries]);

  function addEntry() {
    setEntries((e) => [
      ...e,
      { id: Date.now().toString(36), tz: "UTC", label: "New" },
    ]);
  }

  function updateEntry(id: string, patch: Partial<Entry>) {
    setEntries((e) => e.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function removeEntry(id: string) {
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
                  {Intl.supportedValuesOf("timeZone").map((tz: string) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
              <div className="card-body">
                <div className="time">
                  {DateTime.fromMillis(now)
                    .setZone(entry.tz)
                    .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}
                </div>
                <div className="tz-info">{entry.tz}</div>

                {/* Timeline: 12 one-hour blocks starting at 'now' for this timezone */}
                <div className="timeline" aria-hidden>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const dt = DateTime.fromMillis(now)
                      .setZone(entry.tz)
                      .plus({ hours: i });
                    const label = dt.toFormat("HH:mm");
                    return (
                      <div className="block" key={i} title={dt.toISO()}>
                        <div className="block-time">{label}</div>
                        <div className="block-hour">{dt.toFormat("ha")}</div>
                      </div>
                    );
                  })}
                </div>
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
