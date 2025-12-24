import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all sessions
export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        transcript: true,
        note: true,
      },
      orderBy: {
        sessionDate: 'desc',
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

