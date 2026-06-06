import { NextResponse } from 'next/server';
import { getCourses } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    
    const courses = getCourses();
    
    // Filter courses if a search query is provided
    const filteredCourses = courses.filter(course => 
      course.code.toLowerCase().includes(query) ||
      course.name.toLowerCase().includes(query) ||
      course.department.toLowerCase().includes(query)
    );
    
    return NextResponse.json(filteredCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
