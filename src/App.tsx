import React, { useEffect, useMemo, useRef, useState } from "react";
import { DateTime } from "luxon";
import { useSyncedScroll } from "./useSynchronizedScroll";
import { getTimeZones } from "@vvo/tzdb";
import { Entry } from "./Entry";

export type Entry = {
  id: string;
  tz: string;
  label: string;
  query: string;
  offsetInMinutes: number;
};

export type SearchableZone = {
  zoneName: string;
  city: string;
  display: string;
  offsetInMinutes: number;
};

const STORAGE_KEY = "timezones:data";

function defaultEntry(): Entry {
  return {
    id: Date.now().toString(36),
    tz: DateTime.local().zoneName,
    label: "Local",
    query: "",
    offsetInMinutes: 0,
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

const timezones = getTimeZones({ includeUtc: true });

export default function App(): JSX.Element {
  const register = useSyncedScroll<HTMLDivElement>();
  const [now, setNow] = useState<number>(Date.now());
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);
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

  const saveTimer = useRef<number | null>(null);

  const searchableZones: SearchableZone[] = timezones.flatMap((tz) =>
    tz.mainCities.map((city) => ({
      zoneName: tz.name,
      city,
      display: `${city} (${tz.alternativeName || tz.name})`,
      offsetInMinutes: tz.rawOffsetInMinutes,
    }))
  );

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }, 250);
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [entries]);

  function addEntry() {
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
    navigator.clipboard.writeText(url);
    return url;
  }

  const sortEntries = () => {
    setEntries((entries) =>
      entries.sort((a, b) => {
        return a.offsetInMinutes - b.offsetInMinutes;
      })
    );
  };

  return (
    <>
      <header>
        <h1>Timezones</h1>
        <div className="controls">
          <button onClick={addEntry}>Add entry</button>
          <button onClick={sortEntries}>Sort</button>
          <button
            onClick={() => {
              const url = shareUrl();
              alert("Copied share URL to clipboard:\n" + url);
            }}
          >
            Share
          </button>
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
      </header>

      <main>
        <div className="columns">
          {entries.map((entry) => (
            <Entry
              key={entry.id}
              entry={entry}
              searchableZones={searchableZones}
              updateEntry={updateEntry}
              removeEntry={removeEntry}
              register={register}
              now={now}
              selectedHourIndex={selectedHourIndex}
              setSelectedHourIndex={setSelectedHourIndex}
            />
          ))}
        </div>
      </main>
    </>
  );
}
