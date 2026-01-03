"use client";

import { useState } from 'react';
import { Calendar as BigCalendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Import default styles
import { format, parse, startOfWeek, getDay, addWeeks, subWeeks } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { Event as RBCEvent } from 'react-big-calendar';

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

    const formattedDateRange = `${format(
        startOfWeek(currentDate, { weekStartsOn: 0 }),
        'MMM d'
    )} - ${format(addWeeks(startOfWeek(currentDate, { weekStartsOn: 0 }), 1), 'MMM d')}`;

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <div className="flex items-center justify-between p-4 bg-white shadow-md">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleToday}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-orange-600"
                    >
                        Today
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Next
                    </button>
                </div>
                <div className="text-lg font-semibold text-gray-700">{formattedDateRange}</div>
            </div>
            <div className="flex-grow mt-4"> {/* Added margin-top for spacing */}
                <BigCalendar
                    localizer={localizer}
                    events={events} // Use the passed-in events
                    defaultView={Views.WEEK}
                    views={['week']}
                    step={60}
                    showMultiDayTimes
                    date={currentDate}
                    onNavigate={(date) => setCurrentDate(date)}
                    toolbar={false} // Disable the default toolbar
                    style={{ height: '100%' }}
                />
            </div>
        </div>
    );
}