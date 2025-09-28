import { DateTime } from "luxon";
import { Entry } from "./App";

interface TimelineProps {
  entry: Entry;
  register: (el: HTMLDivElement | null) => void;
  now: number;
  selectedHourIndex: number;
  setSelectedHourIndex: React.Dispatch<React.SetStateAction<number>>;
}

const HOUR_RANGE = 48;

export const Timeline = ({
  now,
  entry,
  register,
  selectedHourIndex,
  setSelectedHourIndex,
}: TimelineProps) => {
  return (
    <div className="card-body">
      <div className="time">
        {DateTime.fromMillis(now)
          .setZone(entry.tz)
          .toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}
      </div>
      <div className="tz-info">{entry.tz}</div>

      <div className="timeline" ref={register}>
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
