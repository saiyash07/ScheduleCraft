import { NextResponse } from 'next/server';
import { getCourses } from '@/lib/db';
import { solveSchedules, SolverConstraints } from '@/lib/solver';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseIds, constraints } = body as {
      courseIds: string[];
      constraints: SolverConstraints;
    };

    if (!courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json({ error: 'courseIds must be an array' }, { status: 400 });
    }

    const allCourses = getCourses();
    
    // Filter down to the selected course objects
    const selectedCourses = allCourses.filter(c => courseIds.includes(c.id));

    if (selectedCourses.length === 0) {
      return NextResponse.json({
        schedules: [],
        metrics: { combinationsChecked: 0, timeTakenMs: 0 }
      });
    }

    // Run solver
    const result = solveSchedules(selectedCourses, constraints);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error running solver:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
