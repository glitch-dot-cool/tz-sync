import { Entry } from "./App";
import { Timeline } from "./TImeline";

interface ViewModeProps {
  entries: Entry[];
  now: number;
  selectedHourIndex: number;
  setSelectedHourIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const ViewMode = ({
  entries,
  now,
  selectedHourIndex,
  setSelectedHourIndex,
}: ViewModeProps) => {
  return (
    <div className="view-mode-container">
      {entries.map((entry) => {
        return (
          <Timeline
            key={entry.id}
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
