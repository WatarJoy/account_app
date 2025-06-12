import React from "react";
import { TooltipWithBounds, useTooltip, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { format, eachDayOfInterval, parseISO, isAfter } from "date-fns";

type HeatmapValue = {
  date: string;
  count: number;
};

interface Props {
  fromDate: string;
  toDate: string;
  values: HeatmapValue[];
}

const COLORS = [
  "#e5e7eb", // gray-200
  "#bbf7d0", // green-200
  "#4ade80", // green-400
  "#16a34a", // green-600
  "#166534", // green-800
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const cellSize = 25;
const gap = 8;

const ExpenseCalendar: React.FC<Props> = ({ fromDate, toDate, values }) => {
  const from = parseISO(fromDate);
  const to = parseISO(toDate);

  if (isAfter(from, to)) {
    return (
      <div className="text-red-600">
        ⚠️ The start date is later than the end date
      </div>
    );
  }

  const minEnd = new Date(from);
  minEnd.setDate(minEnd.getDate() + 90);
  const effectiveTo = to < minEnd ? minEnd : to;

  const allDates = eachDayOfInterval({ start: from, end: effectiveTo });
  const valueMap = new Map(values.map((v) => [v.date, v.count]));

  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  allDates.forEach((date) => {
    if (date.getDay() === 0 && currentWeek.length) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(format(date, "yyyy-MM-dd"));
  });
  if (currentWeek.length) weeks.push(currentWeek);

  const monthLabels: { [weekIndex: number]: string } = {};
  weeks.forEach((week, idx) => {
    if (week.length === 0) return;
    const firstDay = parseISO(week[0]);
    const monthName = format(firstDay, "MMM");
    if (!monthLabels[idx]) {
      monthLabels[idx] = monthName;
    }
  });

  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } =
    useTooltip<{ date: string; count: number }>();

  const handleMouseOver = (
    event: React.MouseEvent,
    date: string,
    count: number
  ) => {
    const coords = localPoint(event) || { x: 0, y: 0 };
    showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: { date, count },
    });
  };

  const getColor = (count: number): string => {
    if (count >= 100) return COLORS[4];
    if (count >= 50) return COLORS[3];
    if (count >= 10) return COLORS[2];
    if (count > 0) return COLORS[1];
    return COLORS[0];
  };

  const width = (cellSize + gap) * weeks.length + 50;
  const height = (cellSize + gap) * 7 + 20;

  const monthLabelOffsetY = 14;
  const topPadding = 24;
  const leftPadding = 40;

  return (
    <div className="relative w-full overflow-x-auto">
      <svg width={width} height={height}>
        {/* Підписи місяців зверху */}
        {Object.entries(monthLabels).map(([weekIdx, month]) => (
          <text
            key={weekIdx}
            x={Number(weekIdx) * (cellSize + gap) + leftPadding}
            y={monthLabelOffsetY}
            fontSize={12}
            fill="#374151"
            fontWeight="600"
          >
            {month}
          </text>
        ))}

        {/* Підписи днів тижня зліва */}
        {WEEKDAYS.map((day, i) => (
          <text
            key={day}
            x={4}
            y={i * (cellSize + gap) + topPadding + cellSize - 2}
            fontSize={10}
            fill="#4b5563"
          >
            {day}
          </text>
        ))}

        {/* Календарні клітинки */}
        {weeks.map((week, x) =>
          week.map((dateStr, y) => {
            const count = valueMap.get(dateStr) ?? 0;
            return (
              <rect
                key={`${x}-${y}`}
                x={x * (cellSize + gap) + leftPadding}
                y={y * (cellSize + gap) + topPadding}
                width={cellSize}
                height={cellSize}
                rx={2}
                ry={2}
                fill={getColor(count)}
                onMouseOver={(e) => handleMouseOver(e, dateStr, count)}
                onMouseOut={hideTooltip}
              />
            );
          })
        )}
      </svg>

      {tooltipData && (
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultStyles, backgroundColor: "white", color: "black" }}
        >
          <div className="text-sm font-medium">
            {format(parseISO(tooltipData.date), "dd MMM yyyy")}
          </div>
          <div>${tooltipData.count}</div>
        </TooltipWithBounds>
      )}
    </div>
  );
};

export default ExpenseCalendar;
