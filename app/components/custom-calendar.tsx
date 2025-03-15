"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export function CustomCalendar({ selectedDate, onDateSelect, disabledDates = [], minDate, maxDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  // Generate calendar days when month changes
  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    setCalendarDays(eachDayOfInterval({ start, end }));
  }, [currentMonth]);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Check if a date is disabled
  const isDisabled = (date: Date) => {
    // Check if date is before minDate or after maxDate
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;

    // Check if date is in disabledDates
    return disabledDates.some((disabledDate) => isSameDay(date, disabledDate));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth} className="h-7 w-7">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-medium">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button variant="outline" size="icon" onClick={nextMonth} className="h-7 w-7">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const disabled = isDisabled(day);

          return (
            <button
              key={i}
              onClick={() => !disabled && onDateSelect?.(day)}
              disabled={disabled}
              className={`
                h-9 w-full rounded-md text-center text-sm p-0 
                ${!isSameMonth(day, currentMonth) ? "text-gray-300" : ""}
                ${isToday(day) ? "bg-gray-100" : ""}
                ${isSelected ? "bg-blue-600 text-white hover:bg-blue-700" : "hover:bg-gray-100"}
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
