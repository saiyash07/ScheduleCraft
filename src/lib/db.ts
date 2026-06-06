import fs from 'fs';
import path from 'path';

// Define TS Interfaces
export interface Timeslot {
  day: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

export interface Section {
  id: string;
  sectionCode: string;
  instructor: string;
  timeslots: Timeslot[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  sections: Section[];
}

export interface SavedSchedule {
  id: string;
  name: string;
  sectionIds: string[]; // List of section IDs that form this schedule
  createdAt: string;
}

const COURSES_FILE_PATH = path.join(process.cwd(), 'src/data/courses.json');
const SAVED_FILE_PATH = path.join(process.cwd(), 'src/data/saved_schedules.json');

// Get all courses from catalog
export function getCourses(): Course[] {
  try {
    if (!fs.existsSync(COURSES_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(COURSES_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Course[];
  } catch (error) {
    console.error('Error reading courses catalog file:', error);
    return [];
  }
}

// Get saved schedules
export function getSavedSchedules(): SavedSchedule[] {
  try {
    if (!fs.existsSync(SAVED_FILE_PATH)) {
      // Create default empty array file
      fs.mkdirSync(path.dirname(SAVED_FILE_PATH), { recursive: true });
      fs.writeFileSync(SAVED_FILE_PATH, '[]', 'utf-8');
      return [];
    }
    const data = fs.readFileSync(SAVED_FILE_PATH, 'utf-8');
    return JSON.parse(data) as SavedSchedule[];
  } catch (error) {
    console.error('Error reading saved schedules file:', error);
    return [];
  }
}

// Save a new schedule
export function saveSchedule(name: string, sectionIds: string[]): SavedSchedule {
  const saved = getSavedSchedules();
  const newSchedule: SavedSchedule = {
    id: 'sched_' + Math.random().toString(36).substring(2, 9),
    name: name || `Schedule ${saved.length + 1}`,
    sectionIds,
    createdAt: new Date().toISOString()
  };
  
  saved.push(newSchedule);
  
  try {
    fs.writeFileSync(SAVED_FILE_PATH, JSON.stringify(saved, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing saved schedules file:', error);
  }
  
  return newSchedule;
}

// Delete a saved schedule
export function deleteSchedule(id: string): boolean {
  const saved = getSavedSchedules();
  const filtered = saved.filter(s => s.id !== id);
  
  if (saved.length === filtered.length) {
    return false;
  }
  
  try {
    fs.writeFileSync(SAVED_FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error deleting saved schedule:', error);
    return false;
  }
}
