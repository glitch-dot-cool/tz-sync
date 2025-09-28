import { Entry, Modes } from "./App";
import { Timeline } from "./TImeline";

interface ViewModeProps {
  entries: Entry[];
  now: number;
  selectedHourIndex: number;
  setSelectedHourIndex: React.Dispatch<React.SetStateAction<number>>;
  mode: Modes;
}

export const ViewMode = ({
  entries,
  now,
  selectedHourIndex,
  setSelectedHourIndex,
  mode,
}: ViewModeProps) => {
  return (
    <div className="view-mode-container">
      {entries.map((entry) => {
        return (
          <Timeline
            key={entry.id}
            mode={mode}
            entry={entry}
            now={now}
            selectedHourIndex={selectedHourIndex}
            setSelectedHourIndex={setSelectedHourIndex}
          />
        );
      })}
    </div>
  );
};
