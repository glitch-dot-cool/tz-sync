import React, { useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { useSyncedScroll } from "./useSynchronizedScroll";
import { getTimeZones } from "@vvo/tzdb";
import { Entry } from "./Entry";
import { Controls } from "./Controls";
import { ViewMode } from "./ViewMode";

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

export type Modes = "view" | "edit";

export const STORAGE_KEY = "timezones:data";

function decodeState(s: string) {
  try {
    return JSON.parse(atob(decodeURIComponent(s))) as Entry[];
  } catch (e) {
    console.error(e);
    return null;
  }
}

const timezones = getTimeZones({ includeUtc: true });

export function defaultEntry(): Entry {
  return {
    id: Date.now().toString(36),
    tz: DateTime.local().zoneName,
    label: "Local",
    query: "",
    offsetInMinutes: 0,
  };
}

export default function App(): JSX.Element {
  const register = useSyncedScroll<HTMLDivElement>();
  const [now, setNow] = useState<number>(Date.now());
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);
  const [mode, setMode] = useState<Modes>("view");
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

  function updateEntry(id: string, patch: Partial<Entry>) {
    setEntries((e) => e.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function removeEntry(id: string) {
    setEntries((e) => e.filter((x) => x.id !== id));
  }

  return (
    <>
      <header>
        <h1>Timezones</h1>
        <Controls
          mode={mode}
          setMode={setMode}
          entries={entries}
          setEntries={setEntries}
        />
      </header>

      <main>
        {mode === "view" && (
          <div className="columns">
            <ViewMode
              entries={entries}
              mode={mode}
              now={now}
              selectedHourIndex={selectedHourIndex}
              setSelectedHourIndex={setSelectedHourIndex}
            />
          </div>
        )}

        {mode === "edit" && (
          <div className="columns">
            {entries.map((entry) => (
              <Entry
                key={entry.id}
                mode={mode}
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
        )}
      </main>
    </>
  );
}
