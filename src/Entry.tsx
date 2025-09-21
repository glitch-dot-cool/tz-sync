import { useState } from "react";
import { Entry as EntryType, SearchableZone } from "./App";
import { DateTime } from "luxon";

interface EntryProps {
  entry: EntryType;
  updateEntry: (id: string, patch: Partial<EntryType>) => void;
  removeEntry: (id: string) => void;
  searchableZones: SearchableZone[];
  register: (el: HTMLDivElement | null) => void;
  now: number;
  selectedHourIndex: number;
  setSelectedHourIndex: React.Dispatch<React.SetStateAction<number>>;
}

const HOUR_RANGE = 24;

export const Entry = ({
  entry,
  searchableZones,
  updateEntry,
  removeEntry,
  register,
  now,
  selectedHourIndex,
  setSelectedHourIndex,
}: EntryProps) => {
  const [filter, setFilter] = useState<string>("");

  function searchZones(query: string): SearchableZone[] {
    if (!query) return searchableZones;

    const lower = query.toLowerCase();

    return searchableZones.filter(
      (z) =>
        z.city.toLowerCase().includes(lower) ||
        z.zoneName.toLowerCase().includes(lower) ||
        z.display.toLowerCase().includes(lower)
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <input
          type="text"
          placeholder="Name"
          value={entry.label}
          onChange={(e) => {
            updateEntry(entry.id, { label: e.target.value });
          }}
        />

        <input
          type="text"
          placeholder="Search by city or timezone..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <select
          value={entry.tz}
          onChange={(e) => {
            const offset = searchableZones.find(
              (zone) => zone.zoneName === e.target.value
            )?.offsetInMinutes;
            updateEntry(entry.id, {
              tz: e.target.value,
              offsetInMinutes: offset,
            });
          }}
          onClick={(e) => {
            // workaround for if the dropdown only has one option
            // it won't fire onChange, so force it via click
            const selection = (e.target as HTMLSelectElement).value;
            const offset = searchableZones.find(
              (zone) => zone.zoneName === selection
            )?.offsetInMinutes;

            updateEntry(entry.id, {
              tz: selection,
              offsetInMinutes: offset,
            });
          }}
        >
          {searchZones(filter).map((z) => (
            <option key={z.zoneName + z.city} value={z.zoneName}>
              {z.display}
            </option>
          ))}
        </select>
        <button
          className="destructive"
          onClick={() => {
            if (confirm(`are you sure you want to delete ${entry.label}?`)) {
              removeEntry(entry.id);
            }
          }}
        >
          Delete
        </button>
      </div>
      <div className="card-body">
        <div className="time">
          {DateTime.fromMillis(now)
            .setZone(entry.tz)
            .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}
        </div>
        <div className="tz-info">{entry.tz}</div>

        <div className="timeline" ref={register}>
          {Array.from({ length: HOUR_RANGE }).map((_, i) => {
            const dt = DateTime.fromMillis(now)
              .setZone(entry.tz)
              .plus({ hours: i });
            const label = dt.toFormat("HH:mm");
            return (
              <button
                className={`block ${
                  i === selectedHourIndex ? "block-current" : ""
                }`}
                key={i}
                title={dt.toISO() || ""}
                onClick={() => setSelectedHourIndex(i)}
              >
                <p className="block-time">{label}</p>
                <p className="block-hour">{dt.toFormat("ha")}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
