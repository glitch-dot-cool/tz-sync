import { Entry as EntryType, Modes, SearchableZone } from "./App";
import { Timeline } from "./TImeline";
import { TimezoneSelect } from "./TimezoneSelect";

interface EntryProps {
  entry: EntryType;
  mode: Modes;
  updateEntry: (id: string, patch: Partial<EntryType>) => void;
  removeEntry: (id: string) => void;
  searchableZones: SearchableZone[];
  now: number;
  selectedHourIndex: number;
  setSelectedHourIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const Entry = ({
  entry,
  mode,
  searchableZones,
  updateEntry,
  removeEntry,
  now,
  selectedHourIndex,
  setSelectedHourIndex,
}: EntryProps) => {
  return (
    <div className="card">
      <div className="card-header sticky">
        <input
          type="text"
          placeholder="Name"
          value={entry.label}
          onChange={(e) => {
            updateEntry(entry.id, { label: e.target.value });
          }}
        />

        <TimezoneSelect
          value={entry.tz}
          zones={searchableZones}
          onChange={(tz, offsetInMinutes) =>
            updateEntry(entry.id, { tz, offsetInMinutes })
          }
          placeholder="Search by city or timezone..."
        />
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
      <Timeline
        entry={entry}
        mode={mode}
        now={now}
        selectedHourIndex={selectedHourIndex}
        setSelectedHourIndex={setSelectedHourIndex}
      />
    </div>
  );
};
