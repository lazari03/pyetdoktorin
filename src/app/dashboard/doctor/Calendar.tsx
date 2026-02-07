"use client";

import { useMemo, useState } from 'react';
import { Calendar as BigCalendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addWeeks,
  subWeeks,
  endOfWeek,
  isWithinInterval,
} from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { Event as RBCEvent } from 'react-big-calendar';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Add the prop type for events
interface CalendarProps {
    events: RBCEvent[];
}

export default function Calendar({ events }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handleNext = () => {
        setCurrentDate((prevDate) => addWeeks(prevDate, 1));
    };

    const handleBack = () => {
        setCurrentDate((prevDate) => subWeeks(prevDate, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const formattedDateRange = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;

    const weekCount = useMemo(() => {
        return events.filter((event) =>
            isWithinInterval(event.start as Date, { start: weekStart, end: weekEnd })
        ).length;
    }, [events, weekStart, weekEnd]);

    const eventPropGetter = (event: RBCEvent) => {
        const status = (event?.resource as { status?: string } | undefined)?.status?.toLowerCase?.();
        if (status === 'accepted') {
            return { style: { backgroundColor: '#7c3aed', color: '#fff', borderRadius: 12, border: 'none' } };
        }
        if (status === 'pending') {
            return { style: { backgroundColor: '#f59e0b', color: '#111827', borderRadius: 12, border: 'none' } };
        }
        if (status === 'rejected') {
            return { style: { backgroundColor: '#e5e7eb', color: '#374151', borderRadius: 12, border: 'none' } };
        }
        return { style: { backgroundColor: '#111827', color: '#fff', borderRadius: 12, border: 'none' } };
    };

    return (
        <div className="calendar-theme flex flex-col gap-4">
            <div className="rounded-2xl border border-purple-100 bg-white/80 backdrop-blur shadow-sm px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold">
                        Weekly schedule
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900">{formattedDateRange}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 rounded-full bg-purple-50 border border-purple-100 px-3 py-2 text-xs font-semibold text-purple-700">
                        {weekCount} sessions
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBack}
                            className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                            aria-label="Previous week"
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={handleToday}
                            className="px-4 h-9 rounded-full bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
                        >
                            Today
                        </button>
                        <button
                            onClick={handleNext}
                            className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                            aria-label="Next week"
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="rounded-3xl border border-purple-50 bg-white shadow-lg p-3">
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    defaultView={Views.WEEK}
                    views={['week']}
                    step={60}
                    showMultiDayTimes
                    date={currentDate}
                    onNavigate={(date) => setCurrentDate(date)}
                    toolbar={false}
                    eventPropGetter={eventPropGetter}
                    className="h-[68vh] min-h-[520px]"
                />
            </div>
            <style jsx global>{`
                .calendar-theme .rbc-time-view,
                .calendar-theme .rbc-time-header,
                .calendar-theme .rbc-header,
                .calendar-theme .rbc-time-content,
                .calendar-theme .rbc-timeslot-group {
                    border-color: #ede9fe;
                }
                .calendar-theme .rbc-time-view {
                    border-radius: 24px;
                    overflow: hidden;
                    background: #ffffff;
                }
                .calendar-theme .rbc-header {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    padding: 10px 0;
                    background: #faf5ff;
                }
                .calendar-theme .rbc-time-gutter {
                    background: #f9fafb;
                }
                .calendar-theme .rbc-time-slot {
                    border-top: 1px solid #f3e8ff;
                }
                .calendar-theme .rbc-label {
                    color: #6b7280;
                    font-size: 11px;
                    padding: 4px 8px;
                }
                .calendar-theme .rbc-event {
                    padding: 6px 10px;
                    font-size: 12px;
                }
                .calendar-theme .rbc-today {
                    background: rgba(124, 58, 237, 0.08);
                }
            `}</style>
        </div>
    );
}
