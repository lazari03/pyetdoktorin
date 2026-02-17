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
  isPast,
} from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { Event as RBCEvent } from 'react-big-calendar';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarProps {
    events: RBCEvent[];
    onSelectEvent?: (event: RBCEvent) => void;
}

export default function Calendar({ events, onSelectEvent }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { t } = useTranslation();

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const formattedDateRange = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;

    const weekCount = useMemo(() => {
        return events.filter((event) =>
            event.start && isWithinInterval(event.start as Date, { start: weekStart, end: weekEnd })
        ).length;
    }, [events, weekStart, weekEnd]);

    const eventPropGetter = (event: RBCEvent) => {
        const end = event.end as Date | undefined;
        const eventIsPast = end ? isPast(end) : false;
        const status = (event?.resource as { status?: string } | undefined)?.status?.toLowerCase?.();

        // Past → gray
        if (eventIsPast || status === 'completed' || status === 'rejected' || status === 'canceled') {
            return { style: { backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: 10, border: '1px solid #d1d5db', opacity: 0.7 }, className: 'cursor-pointer' };
        }
        // Pending → amber
        if (status === 'pending') {
            return { style: { backgroundColor: '#fef3c7', color: '#92400e', borderRadius: 10, border: '2px solid #f59e0b', fontWeight: 600 }, className: 'cursor-pointer' };
        }
        // Upcoming / accepted → green
        return { style: { backgroundColor: '#dcfce7', color: '#166534', borderRadius: 10, border: '2px solid #22c55e', fontWeight: 600 }, className: 'cursor-pointer' };
    };

    // Scroll to 7 AM by default so slots aren't starting at midnight
    const scrollToTime = useMemo(() => {
        const d = new Date();
        d.setHours(7, 0, 0, 0);
        return d;
    }, []);

    return (
        <div className="calendar-theme flex flex-col gap-4">
            {/* Toolbar */}
            <div className="rounded-2xl border border-purple-100 bg-white/80 backdrop-blur shadow-sm px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold">
                        {t('weeklySchedule') || 'Weekly schedule'}
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900">{formattedDateRange}</h2>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Legend */}
                    <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-green-400" />{t('upcoming') || 'Upcoming'}</span>
                        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />{t('pending') || 'Pending'}</span>
                        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-300" />{t('past') || 'Past'}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 rounded-full bg-purple-50 border border-purple-100 px-3 py-2 text-xs font-semibold text-purple-700">
                        {weekCount} {t('sessions') || 'sessions'}
                    </div>
                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentDate((prev) => subWeeks(prev, 1))}
                            className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                            aria-label="Previous week"
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 h-9 rounded-full bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
                        >
                            {t('today') || 'Today'}
                        </button>
                        <button
                            onClick={() => setCurrentDate((prev) => addWeeks(prev, 1))}
                            className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                            aria-label="Next week"
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar grid */}
            <div className="rounded-3xl border border-purple-50 bg-white shadow-lg p-3">
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    defaultView={Views.WEEK}
                    views={[Views.WEEK]}
                    view={Views.WEEK}
                    onView={() => {}}
                    step={30}
                    timeslots={2}
                    showMultiDayTimes
                    date={currentDate}
                    onNavigate={(date) => setCurrentDate(date)}
                    onSelectEvent={onSelectEvent}
                    toolbar={false}
                    eventPropGetter={eventPropGetter}
                    scrollToTime={scrollToTime}
                    min={new Date(2020, 0, 1, 6, 0, 0)}
                    max={new Date(2020, 0, 1, 22, 0, 0)}
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
                    padding: 4px 8px;
                    font-size: 11px;
                    line-height: 1.3;
                    transition: box-shadow 0.15s ease, transform 0.15s ease;
                }
                .calendar-theme .rbc-event:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transform: scale(1.03);
                }
                .calendar-theme .rbc-event-label {
                    font-size: 10px;
                    color: inherit;
                    opacity: 0.8;
                }
                .calendar-theme .rbc-today {
                    background: rgba(124, 58, 237, 0.06);
                }
                .calendar-theme .rbc-current-time-indicator {
                    background-color: #7c3aed;
                    height: 2px;
                }
                .calendar-theme .rbc-current-time-indicator::before {
                    content: '';
                    position: absolute;
                    left: -5px;
                    top: -4px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #7c3aed;
                }
            `}</style>
        </div>
    );
}
