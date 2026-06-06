'use client';

import React from 'react';
import { Course, Section } from '@/lib/db';
import { timeToMinutes } from '@/lib/solver';
import { Award, Calendar, Clock, Smile } from 'lucide-react';

interface ScheduleStatsProps {
  schedule: Section[] | null;
  courses: Course[];
}

export default function ScheduleStats({ schedule, courses }: ScheduleStatsProps) {
  if (!schedule || schedule.length === 0) return null;

  // 1. Calculate Total Credits
  const getCourseForSection = (sectionId: string) => {
    return courses.find(c => c.sections.some(s => s.id === sectionId));
  };
  const totalCredits = schedule.reduce((sum, section) => {
    const course = getCourseForSection(section.id);
    return sum + (course?.credits || 0);
  }, 0);

  // Group timeslots by day
  const dayGroups: { [day: string]: { start: number; end: number }[] } = {};
  schedule.forEach(section => {
    section.timeslots.forEach(slot => {
      if (!dayGroups[slot.day]) {
        dayGroups[slot.day] = [];
      }
      dayGroups[slot.day].push({
        start: timeToMinutes(slot.startTime),
        end: timeToMinutes(slot.endTime)
      });
    });
  });

  // 2. Weekly Free Days (Mon-Fri)
  const activeDays = Object.keys(dayGroups);
  const freeDaysCount = 5 - activeDays.length;
  const freeDaysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    .filter(d => !activeDays.includes(d))
    .map(d => d.substring(0, 3))
    .join(', ') || 'None';

  // 3. Earliest Class Start
  let earliestStartMinutes = Infinity;
  schedule.forEach(section => {
    section.timeslots.forEach(slot => {
      const minutes = timeToMinutes(slot.startTime);
      if (minutes < earliestStartMinutes) {
        earliestStartMinutes = minutes;
      }
    });
  });

  const formatMinutesToTime = (mins: number) => {
    if (mins === Infinity) return 'N/A';
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // 4. Average Gap between classes
  let totalGapMinutes = 0;
  let gapCount = 0;

  Object.keys(dayGroups).forEach(day => {
    const daySlots = [...dayGroups[day]].sort((a, b) => a.start - b.start);
    if (daySlots.length > 1) {
      for (let i = 0; i < daySlots.length - 1; i++) {
        const gap = daySlots[i + 1].start - daySlots[i].end;
        if (gap > 0) {
          totalGapMinutes += gap;
          gapCount++;
        }
      }
    }
  });

  const averageGap = gapCount > 0 ? Math.round(totalGapMinutes / gapCount) : 0;

  return (
    <div className="metrics-row">
      {/* Stat 1: Total Credits */}
      <div className="glass metric-card">
        <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Award size={14} style={{ color: 'var(--accent-purple)' }} />
          Total Credits
        </h5>
        <div className="metric-value">{totalCredits} Cr</div>
        <div className="metric-subtext">{schedule.length} active courses</div>
      </div>

      {/* Stat 2: Free Days */}
      <div className="glass metric-card">
        <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={14} style={{ color: 'var(--accent-emerald)' }} />
          Free Days
        </h5>
        <div className="metric-value">{freeDaysCount} Days</div>
        <div className="metric-subtext">Free: {freeDaysList}</div>
      </div>

      {/* Stat 3: Earliest Class */}
      <div className="glass metric-card">
        <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={14} style={{ color: 'var(--accent-amber)' }} />
          Earliest Start
        </h5>
        <div className="metric-value" style={{ fontSize: '1.35rem', paddingTop: '0.15rem', paddingBottom: '0.15rem' }}>
          {formatMinutesToTime(earliestStartMinutes)}
        </div>
        <div className="metric-subtext">Set alarm accordingly!</div>
      </div>

      {/* Stat 4: Average Gap */}
      <div className="glass metric-card">
        <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Smile size={14} style={{ color: 'var(--accent-indigo)' }} />
          Average Gap
        </h5>
        <div className="metric-value">
          {averageGap > 0 ? `${averageGap} min` : '0 min'}
        </div>
        <div className="metric-subtext">Break between lectures</div>
      </div>
    </div>
  );
}
