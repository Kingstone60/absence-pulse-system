
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockLeaveRequests, mockCurrentAbsences, leaveTypeLabels } from '@/utils/mockData';

export function LeaveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getEventsForDate = (date: number) => {
    const targetDate = new Date(currentYear, currentMonth, date);
    const events = [];

    // Check approved leave requests
    mockLeaveRequests
      .filter(req => req.status === 'approved')
      .forEach(request => {
        if (targetDate >= request.startDate && targetDate <= request.endDate) {
          events.push({
            type: request.type,
            employee: request.employee.name,
            color: getTypeColor(request.type)
          });
        }
      });

    // Check current absences
    mockCurrentAbsences.forEach(absence => {
      if (targetDate >= absence.startDate && targetDate <= absence.endDate) {
        events.push({
          type: absence.type,
          employee: absence.employee.name,
          color: getTypeColor(absence.type)
        });
      }
    });

    return events;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      annual: 'bg-blue-500',
      sick: 'bg-red-500',
      personal: 'bg-green-500',
      maternity: 'bg-purple-500',
      emergency: 'bg-orange-500',
      unpaid: 'bg-gray-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Calendrier des congés</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {monthNames[currentMonth]} {currentYear}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} className="h-24 p-1"></div>
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const date = i + 1;
              const events = getEventsForDate(date);
              const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, date).toDateString();

              return (
                <div
                  key={date}
                  className={`h-24 p-1 border border-gray-200 ${
                    isToday ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {date}
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 2).map((event, idx) => (
                      <div
                        key={idx}
                        className={`text-xs text-white px-1 py-0.5 rounded truncate ${event.color}`}
                        title={`${event.employee} - ${leaveTypeLabels[event.type as keyof typeof leaveTypeLabels]}`}
                      >
                        {event.employee.split(' ')[0]}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{events.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Légende</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(leaveTypeLabels).map(([type, label]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${getTypeColor(type)}`}></div>
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
