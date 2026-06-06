import { Course, Section, Timeslot } from './db';

export interface SolverConstraints {
  noFridays: boolean;
  noEightAM: boolean;
  maxClassesPerDay: number; // 0 means unlimited
  maxConsecutiveHours: number; // 0 means unlimited
}

// Convert "HH:MM" time string to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Check if two timeslots overlap
export function doSlotsOverlap(slotA: Timeslot, slotB: Timeslot): boolean {
  if (slotA.day !== slotB.day) return false;
  
  const startA = timeToMinutes(slotA.startTime);
  const endA = timeToMinutes(slotA.endTime);
  const startB = timeToMinutes(slotB.startTime);
  const endB = timeToMinutes(slotB.endTime);
  
  return startA < endB && startB < endA;
}

// Check if a section overlaps with any section already in the schedule
export function doesSectionOverlap(section: Section, schedule: Section[]): boolean {
  for (const scheduledSection of schedule) {
    for (const slotA of section.timeslots) {
      for (const slotB of scheduledSection.timeslots) {
        if (doSlotsOverlap(slotA, slotB)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Check if a section satisfies general user constraints
export function satisfiesConstraints(
  section: Section,
  currentSchedule: Section[],
  constraints: SolverConstraints
): boolean {
  // Combine all active timeslots of the current schedule + this new section
  const proposedSchedule = [...currentSchedule, section];

  for (const slot of section.timeslots) {
    // 1. No Fridays constraint
    if (constraints.noFridays && slot.day.toLowerCase() === 'friday') {
      return false;
    }

    // 2. No 8 AM classes (start before 09:00 AM)
    if (constraints.noEightAM && timeToMinutes(slot.startTime) < 540) {
      return false;
    }
  }

  // Group timeslots by day for daily constraints
  const dayGroups: { [day: string]: Timeslot[] } = {};
  for (const sec of proposedSchedule) {
    for (const slot of sec.timeslots) {
      if (!dayGroups[slot.day]) {
        dayGroups[slot.day] = [];
      }
      dayGroups[slot.day].push(slot);
    }
  }

  for (const day of Object.keys(dayGroups)) {
    const daySlots = dayGroups[day];

    // 3. Max classes per day constraint
    if (constraints.maxClassesPerDay > 0 && daySlots.length > constraints.maxClassesPerDay) {
      return false;
    }

    // 4. Max consecutive hours constraint
    if (constraints.maxConsecutiveHours > 0) {
      // Sort slots by start time
      const sortedSlots = [...daySlots].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );

      let currentBlockDuration = 0;
      let previousEnd = -1;

      for (const slot of sortedSlots) {
        const start = timeToMinutes(slot.startTime);
        const end = timeToMinutes(slot.endTime);
        const duration = end - start;

        // If it starts right after the previous class (or with less than a 15-minute gap),
        // we consider it consecutive.
        if (previousEnd !== -1 && start - previousEnd <= 15) {
          currentBlockDuration += duration + (start - previousEnd);
        } else {
          // Restart consecutive block
          currentBlockDuration = duration;
        }

        // Check if consecutive block exceeds the limit (converted to minutes)
        if (currentBlockDuration > constraints.maxConsecutiveHours * 60) {
          return false;
        }

        previousEnd = end;
      }
    }
  }

  return true;
}

export interface SolverMetrics {
  combinationsChecked: number;
  timeTakenMs: number;
}

export interface SolverResult {
  schedules: Section[][];
  metrics: SolverMetrics;
}

// Backtracking Solver Algorithm
export function solveSchedules(
  selectedCourses: Course[],
  constraints: SolverConstraints
): SolverResult {
  const startTime = performance.now();
  let combinationsChecked = 0;
  const results: Section[][] = [];

  function backtrack(courseIndex: number, currentSchedule: Section[]) {
    // base case: all courses processed successfully
    if (courseIndex === selectedCourses.length) {
      results.push([...currentSchedule]);
      return;
    }

    combinationsChecked++;
    const course = selectedCourses[courseIndex];

    for (const section of course.sections) {
      // Check for structural overlaps
      if (doesSectionOverlap(section, currentSchedule)) {
        continue;
      }

      // Check for user-defined constraints
      if (!satisfiesConstraints(section, currentSchedule, constraints)) {
        continue;
      }

      // Choose
      currentSchedule.push(section);

      // Explore
      backtrack(courseIndex + 1, currentSchedule);

      // Unchoose (backtrack)
      currentSchedule.pop();
    }
  }

  // Run the recursive search starting from index 0
  if (selectedCourses.length > 0) {
    backtrack(0, []);
  }

  const endTime = performance.now();

  return {
    schedules: results,
    metrics: {
      combinationsChecked,
      timeTakenMs: Math.round(endTime - startTime)
    }
  };
}
