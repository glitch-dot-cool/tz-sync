import { DateTime } from "luxon";
import { Entry, Modes } from "./App";

interface InfoProps {
  entry: Entry;
  now: number;
  mode: Modes;
}

export const Info = ({ entry, now, mode }: InfoProps) => {
  return (
    <div className="sticky">
      {mode === "view" && <h3>{entry.label}</h3>}
      <div className="time">
        {DateTime.fromMillis(now)
          .setZone(entry.tz)
          .toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}
      </div>
      <div className="tz-info">{entry.tz}</div>
    </div>
  );
};
