import { DateTime } from "luxon";
import { Entry, Modes } from "./App";
import { Info } from "./Info";

interface TimelineProps {
  entry: Entry;
  mode: Modes;
  register?: (el: HTMLDivElement | null) => void;
  now: number;
  selectedHourIndex: number;
  setSelectedHourIndex: React.Dispatch<React.SetStateAction<number>>;
}

const HOUR_RANGE = 48;

export const Timeline = ({
  now,
  mode,
  entry,
  register,
  selectedHourIndex,
  setSelectedHourIndex,
}: TimelineProps) => {
  const timelineScrollBehaviorClass = mode === "edit" ? "overflow-x-auto" : "";
  const timelineVerticalPaddingClass =
    mode === "view" ? "vertical-spacing" : "";

  return (
    <div className={`card-body ${timelineVerticalPaddingClass}`}>
      <Info entry={entry} now={now} mode={mode} />

      <div className={`timeline ${timelineScrollBehaviorClass}`} ref={register}>
        {Array.from({ length: HOUR_RANGE }).map((_, i) => {
          const dt = DateTime.fromMillis(now)
            .setZone(entry.tz)
            .plus({ hours: i });
          const hour = dt.toFormat("ha");
          const hoursAndMinutes = dt.toFormat("HH:mm");
          return (
            <button
              className={`block ${
                i === selectedHourIndex ? "block-current" : ""
              } ${hour === "12AM" ? "day-boundary" : ""}`}
              key={i}
              title={dt.toISO() || ""}
              onClick={() => setSelectedHourIndex(i)}
            >
              <p className="block-time">{hoursAndMinutes}</p>
              <p className="block-hour">{hour}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
