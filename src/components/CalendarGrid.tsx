'use client';

import React from 'react';
import { Course, Section } from '@/lib/db';
import { timeToMinutes } from '@/lib/solver';
import { Calendar, AlertTriangle } from 'lucide-react';

interface CalendarGridProps {
  schedule: Section[] | null;
  courses: Course[];
  hasSolved?: boolean;
  combinationsChecked?: number;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const START_HOUR = 8;  // 8:00 AM
const END_HOUR = 18;  // 6:00 PM
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60; // 10 hours = 600 minutes
const START_MINUTES = START_HOUR * 60; // 480 minutes

export default function CalendarGrid({
  schedule,
  courses,
  hasSolved = false,
  combinationsChecked = 0
}: CalendarGridProps) {
  
  // Helper to find course associated with a section ID
  const getCourseForSection = (sectionId: string) => {
    return courses.find(c => c.sections.some(s => s.id === sectionId));
  };

  const getDeptColorClass = (dept: string) => {
    switch (dept?.toLowerCase()) {
      case 'computer science': return 'block-cs';
      case 'mathematics': return 'block-math';
      case 'physics': return 'block-phys';
      case 'english': return 'block-lit';
      case 'chemistry': return 'block-chem';
      default: return 'block-cs';
    }
  };

  // Render Left Time Scale (e.g. 08:00, 09:00, etc.)
  const renderTimeLabels = () => {
    const labels = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      const displayHour = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      labels.push(
        <div key={h} className="time-label">
          {displayHour}:00 {ampm}
        </div>
      );
    }
    return labels;
  };

  return (
    <div className="glass calendar-card">
      {schedule && schedule.length > 0 ? (
        <div className="calendar-grid">
          {/* Header Row */}
          <div className="calendar-header-cell" style={{ borderLeft: 'none' }}>Time</div>
          {DAYS.map(day => (
            <div key={day} className="calendar-header-cell">
              {day.substring(0, 3)}
            </div>
          ))}

          {/* Time scale column */}
          <div className="time-col">
            {renderTimeLabels()}
          </div>

          {/* Day Columns */}
          {DAYS.map(day => {
            // Find all section slots scheduled on this day
            const dailySlots = [];
            
            for (const section of schedule) {
              const course = getCourseForSection(section.id);
              for (const slot of section.timeslots) {
                if (slot.day === day) {
                  dailySlots.push({
                    course,
                    section,
                    slot
                  });
                }
              }
            }

            return (
              <div key={day} className="day-col">
                {dailySlots.map(({ course, section, slot }, idx) => {
                  const startMin = timeToMinutes(slot.startTime);
                  const endMin = timeToMinutes(slot.endTime);
                  
                  // Calculate absolute percentages based on minutes
                  const topPercent = ((startMin - START_MINUTES) / TOTAL_MINUTES) * 100;
                  const heightPercent = ((endMin - startMin) / TOTAL_MINUTES) * 100;

                  const colorClass = getDeptColorClass(course?.department || '');

                  return (
                    <div
                      key={`${section.id}-${idx}`}
                      className={`course-block ${colorClass}`}
                      style={{
                        top: `${topPercent}%`,
                        height: `${heightPercent}%`,
                      }}
                      title={`${course?.name || ''} (${section.sectionCode}) - ${slot.startTime} to ${slot.endTime} with ${section.instructor}`}
                    >
                      <div className="block-code">{course?.code || 'COURSE'}</div>
                      <div className="block-name">{course?.name || 'Class'}</div>
                      <div className="block-meta">
                        <span>{section.sectionCode}</span>
                        <span>{slot.startTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : hasSolved ? (
        <div className="empty-state" style={{ border: '1px solid rgba(244, 63, 94, 0.2)', background: 'rgba(244, 63, 94, 0.02)', borderRadius: 'var(--radius-md)' }}>
          <AlertTriangle className="empty-state-icon" style={{ color: 'var(--accent-rose)', opacity: 0.8 }} />
          <h3 style={{ color: 'var(--accent-rose)' }}>No Conflict-Free Schedules Found</h3>
          <p style={{ maxWidth: '460px' }}>
            The solver checked <strong>{combinationsChecked}</strong> combinations but could not find a layout that satisfies all of your active constraints.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '420px', marginTop: '0.5rem' }}>
            <strong>How to fix this:</strong> Disable "Avoid Friday Classes" (especially if taking MATH 101 or LIT 101), disable "Avoid Early 8 AM Classes", or remove one of the conflicting courses from your selection cart.
          </p>
        </div>
      ) : (
        <div className="empty-state">
          <Calendar className="empty-state-icon" />
          <h3>No Schedule Visualized</h3>
          <p>
            Add courses in the cart, select your solving constraints, and click <strong>"Generate Schedules"</strong> to build your calendars.
          </p>
        </div>
      )}
    </div>
  );
}
