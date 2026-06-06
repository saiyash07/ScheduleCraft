import { NextResponse } from 'next/server';
import { getSavedSchedules, saveSchedule, deleteSchedule } from '@/lib/db';

export async function GET() {
  try {
    const schedules = getSavedSchedules();
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching saved schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch saved schedules' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, sectionIds } = body as { name: string; sectionIds: string[] };

    if (!sectionIds || !Array.isArray(sectionIds) || sectionIds.length === 0) {
      return NextResponse.json({ error: 'sectionIds must be a non-empty array' }, { status: 400 });
    }

    const saved = saveSchedule(name, sectionIds);
    return NextResponse.json(saved);
  } catch (error) {
    console.error('Error saving schedule:', error);
    return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing schedule ID' }, { status: 400 });
    }

    const success = deleteSchedule(id);
    if (!success) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}
