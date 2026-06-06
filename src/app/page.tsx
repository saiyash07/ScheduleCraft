'use client';

import React, { useState, useEffect } from 'react';
import { Course, Section, SavedSchedule } from '@/lib/db';
import { SolverConstraints, SolverMetrics } from '@/lib/solver';
import CourseSelector from '@/components/CourseSelector';
import ConstraintPanel from '@/components/ConstraintPanel';
import CalendarGrid from '@/components/CalendarGrid';
import ScheduleStats from '@/components/ScheduleStats';
import SavedSchedules from '@/components/SavedSchedules';
import { Cpu, ChevronLeft, ChevronRight, Save, Layout, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  // 1. Core State
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [constraints, setConstraints] = useState<SolverConstraints>({
    noFridays: false,
    noEightAM: false,
    maxClassesPerDay: 0,
    maxConsecutiveHours: 0
  });

  // Solver outputs
  const [solutions, setSolutions] = useState<Section[][]>([]);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState<number>(0);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [solverMetrics, setSolverMetrics] = useState<SolverMetrics | null>(null);

  // Saved schedules state
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);

  // Save Modal state
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [newScheduleName, setNewScheduleName] = useState<string>('');

  // Loaded/Overridden Schedule (when loading a saved schedule directly)
  const [loadedScheduleSections, setLoadedScheduleSections] = useState<Section[] | null>(null);

  // 2. Fetch Initial Data
  useEffect(() => {
    async function initData() {
      try {
        // Fetch course catalog
        const resCourses = await fetch('/api/courses');
        const coursesData = await resCourses.json();
        setCourses(coursesData);

        // Fetch saved schedules
        const resSaved = await fetch('/api/saved');
        const savedData = await resSaved.json();
        setSavedSchedules(savedData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }
    initData();
  }, []);

  // 3. Handlers
  const handleAddCourse = (id: string) => {
    if (!selectedCourseIds.includes(id)) {
      setSelectedCourseIds([...selectedCourseIds, id]);
      setLoadedScheduleSections(null);
      setActiveSavedId(null);
      setSolutions([]);
      setSolverMetrics(null);
    }
  };

  const handleRemoveCourse = (id: string) => {
    setSelectedCourseIds(selectedCourseIds.filter(cid => cid !== id));
    setLoadedScheduleSections(null);
    setActiveSavedId(null);
    setSolutions([]);
    setSolverMetrics(null);
  };

  const handleConstraintChange = (newConstraints: SolverConstraints) => {
    setConstraints(newConstraints);
    setSolutions([]);
    setSolverMetrics(null);
    setLoadedScheduleSections(null);
    setActiveSavedId(null);
  };

  // Solve schedules using backtracking endpoint
  const handleSolve = async () => {
    if (selectedCourseIds.length === 0) return;
    setIsSolving(true);
    setLoadedScheduleSections(null);
    setActiveSavedId(null);

    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseIds: selectedCourseIds,
          constraints
        })
      });

      const data = await response.json();
      setSolutions(data.schedules);
      setSolverMetrics(data.metrics);
      setCurrentSolutionIndex(0);
    } catch (err) {
      console.error('Error solving schedules:', err);
    } finally {
      setIsSolving(false);
    }
  };

  // Saved Schedules operations
  const handleLoadSaved = (saved: SavedSchedule) => {
    // 1. Match section IDs back to full section objects
    const resolvedSections: Section[] = [];
    const parentCourseIds: string[] = [];

    saved.sectionIds.forEach(secId => {
      courses.forEach(course => {
        const matchingSection = course.sections.find(s => s.id === secId);
        if (matchingSection) {
          // Store section with a hacky property inject if needed, or raw section
          resolvedSections.push({
            ...matchingSection,
            // Attach course id reference to look up course details inside calendar
            id: matchingSection.id 
          });
          if (!parentCourseIds.includes(course.id)) {
            parentCourseIds.push(course.id);
          }
        }
      });
    });

    // 2. Set states
    setLoadedScheduleSections(resolvedSections);
    setSelectedCourseIds(parentCourseIds);
    setActiveSavedId(saved.id);
    setSolutions([]); // Clear current solved solutions
    setSolverMetrics(null);
  };

  const handleSaveCurrent = async () => {
    const activeSchedule = loadedScheduleSections || solutions[currentSolutionIndex];
    if (!activeSchedule || activeSchedule.length === 0) return;

    try {
      const sectionIds = activeSchedule.map(s => s.id);
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newScheduleName,
          sectionIds
        })
      });

      if (res.ok) {
        const savedObject = await res.json();
        setSavedSchedules([...savedSchedules, savedObject]);
        setActiveSavedId(savedObject.id);
        
        // Convert to a loaded static state
        setLoadedScheduleSections(activeSchedule);
        setSolutions([]);
        setSolverMetrics(null);

        // Reset fields
        setNewScheduleName('');
        setShowSaveModal(false);
      }
    } catch (err) {
      console.error('Error saving schedule:', err);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      const res = await fetch(`/api/saved?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSavedSchedules(savedSchedules.filter(s => s.id !== id));
        if (activeSavedId === id) {
          setActiveSavedId(null);
          setLoadedScheduleSections(null);
        }
      }
    } catch (err) {
      console.error('Error deleting saved schedule:', err);
    }
  };

  // Navigation handlers
  const handlePrevSolution = () => {
    if (currentSolutionIndex > 0) {
      setCurrentSolutionIndex(currentSolutionIndex - 1);
    }
  };

  const handleNextSolution = () => {
    if (currentSolutionIndex < solutions.length - 1) {
      setCurrentSolutionIndex(currentSolutionIndex + 1);
    }
  };

  // Determine which schedule is currently active for display
  const activeDisplaySchedule = loadedScheduleSections || (solutions.length > 0 ? solutions[currentSolutionIndex] : null);

  return (
    <div className="app-container">
      {/* Header Banner */}
      <header className="app-header">
        <div className="brand-section">
          <h1>
            <Layout size={32} style={{ color: 'var(--accent-indigo)' }} />
            ScheduleCraft
          </h1>
          <p>Constraint Satisfaction Solver for Student Academic Schedules</p>
        </div>
        
        {/* Solver Execution Stats */}
        {solverMetrics && (
          <div className="solver-metrics-badge">
            <Cpu size={14} />
            <span>Solved in {solverMetrics.timeTakenMs}ms ({solverMetrics.combinationsChecked} combos checked)</span>
          </div>
        )}
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Hand Controller Column */}
        <aside className="sidebar">
          {/* Selector Cart */}
          <CourseSelector
            courses={courses}
            selectedCourseIds={selectedCourseIds}
            onAddCourse={handleAddCourse}
            onRemoveCourse={handleRemoveCourse}
          />

          {/* Constraints Input Form */}
          <ConstraintPanel
            constraints={constraints}
            onChangeConstraints={handleConstraintChange}
            onSolve={handleSolve}
            isSolving={isSolving}
            canSolve={selectedCourseIds.length > 0}
          />

          {/* Saved Schedules Manager */}
          <SavedSchedules
            savedSchedules={savedSchedules}
            courses={courses}
            activeSavedId={activeSavedId}
            onLoadSchedule={handleLoadSaved}
            onDeleteSchedule={handleDeleteSaved}
          />
        </aside>

        {/* Right Hand Calendar Grid Visualizer */}
        <main className="main-display">
          {/* Header Controls for viewing multiple solutions */}
          {(solutions.length > 0 || loadedScheduleSections) && (
            <div className="schedule-nav-header">
              <div className="schedule-nav">
                {solutions.length > 0 && (
                  <>
                    <button
                      className="btn-nav"
                      onClick={handlePrevSolution}
                      disabled={currentSolutionIndex === 0}
                      title="Previous Schedule Option"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="nav-indicator">
                      Schedule <strong>{currentSolutionIndex + 1}</strong> of <strong>{solutions.length}</strong>
                    </span>
                    <button
                      className="btn-nav"
                      onClick={handleNextSolution}
                      disabled={currentSolutionIndex === solutions.length - 1}
                      title="Next Schedule Option"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                {loadedScheduleSections && (
                  <span className="nav-indicator" style={{ color: 'var(--accent-emerald)' }}>
                    ✓ Loaded Saved Schedule: <strong>{savedSchedules.find(s => s.id === activeSavedId)?.name}</strong>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <button
                className="btn-save-schedule"
                onClick={() => setShowSaveModal(true)}
                title="Save this schedule layout"
              >
                <Save size={16} />
                Save Schedule Layout
              </button>
            </div>
          )}

          {/* Calendar Display Grid */}
          <div style={{ position: 'relative' }}>
            {isSolving && (
              <div className="solving-overlay">
                <div className="spinner"></div>
                <h4 style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Solving constraints...</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Backtracking through course sections...</p>
              </div>
            )}
            <CalendarGrid
              schedule={activeDisplaySchedule}
              courses={courses}
              hasSolved={solverMetrics !== null}
              combinationsChecked={solverMetrics?.combinationsChecked}
            />
          </div>

          {/* Calculations metrics bottom bar */}
          <ScheduleStats
            schedule={activeDisplaySchedule}
            courses={courses}
          />
        </main>
      </div>

      {/* Save Schedule Modal Popup */}
      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h3>Save Schedule Configuration</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Give this calendar layout a recognizable name to store it in the database.
            </p>
            <input
              type="text"
              className="modal-input"
              placeholder="e.g. Dream Schedule, No Friday Option..."
              value={newScheduleName}
              onChange={(e) => setNewScheduleName(e.target.value)}
              autoFocus
            />
            <div className="modal-buttons">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowSaveModal(false);
                  setNewScheduleName('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSaveCurrent}
                disabled={!newScheduleName.trim()}
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
