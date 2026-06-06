'use client';

import React from 'react';
import { SolverConstraints } from '@/lib/solver';
import { Settings, Play, RefreshCw } from 'lucide-react';

interface ConstraintPanelProps {
  constraints: SolverConstraints;
  onChangeConstraints: (constraints: SolverConstraints) => void;
  onSolve: () => void;
  isSolving: boolean;
  canSolve: boolean;
}

export default function ConstraintPanel({
  constraints,
  onChangeConstraints,
  onSolve,
  isSolving,
  canSolve
}: ConstraintPanelProps) {
  
  const handleToggle = (key: keyof SolverConstraints) => {
    onChangeConstraints({
      ...constraints,
      [key]: !constraints[key]
    });
  };

  const handleNumberChange = (key: keyof SolverConstraints, value: number) => {
    onChangeConstraints({
      ...constraints,
      [key]: value
    });
  };

  return (
    <div className="glass" style={{ padding: '1.25rem' }}>
      <h3 className="panel-title">
        <Settings size={18} />
        Solver Preferences
      </h3>

      <div className="constraint-list" style={{ marginBottom: '1.5rem' }}>
        {/* Toggle 1: No Friday Classes */}
        <div className="toggle-group">
          <label htmlFor="noFridays" className="toggle-label" style={{ cursor: 'pointer', flex: 1 }}>
            Avoid Friday Classes
          </label>
          <label className="switch">
            <input
              type="checkbox"
              id="noFridays"
              checked={constraints.noFridays}
              onChange={() => handleToggle('noFridays')}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Toggle 2: No 8 AM Classes */}
        <div className="toggle-group">
          <label htmlFor="noEightAM" className="toggle-label" style={{ cursor: 'pointer', flex: 1 }}>
            Avoid Early 8 AM Classes
          </label>
          <label className="switch">
            <input
              type="checkbox"
              id="noEightAM"
              checked={constraints.noEightAM}
              onChange={() => handleToggle('noEightAM')}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Number 1: Max Classes Per Day */}
        <div className="input-group">
          <span className="toggle-label" style={{ display: 'flex', flexDirection: 'column' }}>
            <span>Max Classes Per Day</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0 means unlimited</span>
          </span>
          <input
            type="number"
            min="0"
            max="6"
            className="number-input"
            value={constraints.maxClassesPerDay}
            onChange={(e) => handleNumberChange('maxClassesPerDay', Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>

        {/* Number 2: Max Consecutive Hours */}
        <div className="input-group">
          <span className="toggle-label" style={{ display: 'flex', flexDirection: 'column' }}>
            <span>Max Back-to-Back Hours</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0 means unlimited</span>
          </span>
          <input
            type="number"
            min="0"
            max="8"
            className="number-input"
            value={constraints.maxConsecutiveHours}
            onChange={(e) => handleNumberChange('maxConsecutiveHours', Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>
      </div>

      {/* Solver trigger button */}
      <button
        className="btn-solve"
        onClick={onSolve}
        disabled={isSolving || !canSolve}
      >
        {isSolving ? (
          <>
            <RefreshCw size={18} className="spinner" style={{ animationDuration: '2s' }} />
            Solving Constraints...
          </>
        ) : (
          <>
            <Play size={18} />
            Generate Schedules
          </>
        )}
      </button>
    </div>
  );
}
