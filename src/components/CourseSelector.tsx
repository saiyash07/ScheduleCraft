'use client';

import React, { useState } from 'react';
import { Course } from '@/lib/db';
import { Search, Plus, Trash2, BookOpen } from 'lucide-react';

interface CourseSelectorProps {
  courses: Course[];
  selectedCourseIds: string[];
  onAddCourse: (id: string) => void;
  onRemoveCourse: (id: string) => void;
}

export default function CourseSelector({
  courses,
  selectedCourseIds,
  onAddCourse,
  onRemoveCourse
}: CourseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter available courses based on search query
  const filteredCourses = courses.filter(course =>
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group selected courses
  const selectedCourses = courses.filter(c => selectedCourseIds.includes(c.id));

  // Helper to get department styling badge
  const getDeptBadgeClass = (dept: string) => {
    switch (dept.toLowerCase()) {
      case 'computer science': return 'badge-cs';
      case 'mathematics': return 'badge-math';
      case 'physics': return 'badge-phys';
      case 'english': return 'badge-lit';
      case 'chemistry': return 'badge-chem';
      default: return 'badge-cs';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search and Library Section */}
      <div className="glass" style={{ padding: '1.25rem' }}>
        <h3 className="panel-title">
          <BookOpen size={18} />
          Course Catalog
        </h3>
        
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by code, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="course-list">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const isAdded = selectedCourseIds.includes(course.id);
              return (
                <div key={course.id} className="course-item">
                  <div className="course-info">
                    <h4>{course.code}</h4>
                    <p>{course.name}</p>
                    <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span className={`badge ${getDeptBadgeClass(course.department)}`}>
                        {course.department}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        • {course.credits} Credits
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn-add"
                    onClick={() => onAddCourse(course.id)}
                    disabled={isAdded}
                    style={{ opacity: isAdded ? 0.3 : 1, cursor: isAdded ? 'not-allowed' : 'pointer' }}
                    title={isAdded ? "Already added" : "Add to schedule cart"}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>
              No courses found.
            </p>
          )}
        </div>
      </div>

      {/* Selection Cart Section */}
      <div className="glass" style={{ padding: '1.25rem' }}>
        <div className="cart-header">
          <h3 className="panel-title" style={{ marginBottom: 0 }}>
            Selected Courses ({selectedCourses.length})
          </h3>
          {selectedCourses.length > 0 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-indigo)', fontWeight: '600' }}>
              {selectedCourses.reduce((sum, c) => sum + c.credits, 0)} Credits Total
            </span>
          )}
        </div>

        {selectedCourses.length > 0 ? (
          <div className="cart-list">
            {selectedCourses.map((course) => (
              <div key={course.id} className="cart-item">
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {course.code}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    ({course.credits} cr)
                  </span>
                </div>
                <button
                  className="btn-remove"
                  onClick={() => onRemoveCourse(course.id)}
                  title="Remove course"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1.5rem' }}>
            Add courses from the catalog above to build your cart.
          </p>
        )}
      </div>
    </div>
  );
}
