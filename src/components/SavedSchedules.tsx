'use client';

import React from 'react';
import { Course, SavedSchedule } from '@/lib/db';
import { Bookmark, Trash2 } from 'lucide-react';

interface SavedSchedulesProps {
  savedSchedules: SavedSchedule[];
  courses: Course[];
  activeSavedId: string | null;
  onLoadSchedule: (schedule: SavedSchedule) => void;
  onDeleteSchedule: (id: string) => void;
}

export default function SavedSchedules({
  savedSchedules,
  courses,
  activeSavedId,
  onLoadSchedule,
  onDeleteSchedule
}: SavedSchedulesProps) {
  
  // Resolve course names for display based on section IDs
  const getCourseCodesForSaved = (sectionIds: string[]) => {
    const codes: string[] = [];
    sectionIds.forEach(secId => {
      const course = courses.find(c => c.sections.some(s => s.id === secId));
      if (course && !codes.includes(course.code)) {
        codes.push(course.code);
      }
    });
    return codes.join(', ');
  };

  return (
    <div className="glass" style={{ padding: '1.25rem' }}>
      <h3 className="panel-title">
        <Bookmark size={18} />
        Saved Schedules
      </h3>

      <div className="saved-schedules-list">
        {savedSchedules.length > 0 ? (
          savedSchedules.map((schedule) => {
            const isActive = activeSavedId === schedule.id;
            return (
              <div
                key={schedule.id}
                className="saved-item"
                onClick={() => onLoadSchedule(schedule)}
                style={{
                  borderColor: isActive ? 'var(--accent-indigo)' : 'var(--border-color)',
                  background: isActive ? 'rgba(99, 102, 241, 0.04)' : 'var(--bg-secondary)'
                }}
              >
                <div className="saved-item-info">
                  <h4>{schedule.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {getCourseCodesForSaved(schedule.sectionIds)}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    Saved: {new Date(schedule.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="btn-remove"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent loading click trigger
                    if (confirm(`Delete saved schedule "${schedule.name}"?`)) {
                      onDeleteSchedule(schedule.id);
                    }
                  }}
                  title="Delete saved schedule"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>
            No saved schedules yet.
          </p>
        )}
      </div>
    </div>
  );
}
