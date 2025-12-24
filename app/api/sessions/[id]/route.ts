import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single session
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      include: {
        transcript: true,
        note: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Transform to match frontend format
    const transformed = {
      id: session.id,
      patient_name: session.patientName,
      session_date: session.sessionDate.toISOString().split('T')[0],
      signed: session.signed,
      signed_at: session.signedAt?.toISOString(),
      transcript: session.transcript.map((t) => ({
        id: t.id,
        speaker: t.speaker as 'clinician' | 'patient',
        text: t.text,
        start_ms: t.startMs,
        end_ms: t.endMs,
      })),
      note: session.note.map((n) => ({
        id: n.id,
        section: n.section as 'subjective' | 'objective' | 'assessment' | 'plan',
        text: n.text,
        citations: JSON.parse(n.citations),
        needs_confirmation: n.needsConfirmation,
      })),
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// PATCH update session
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { signed, signedAt, note } = body;

    // Update session
    const updateData: {
      signed?: boolean;
      signedAt?: Date;
    } = {};
    if (signed !== undefined) updateData.signed = signed;
    if (signedAt !== undefined) updateData.signedAt = new Date(signedAt);

    await prisma.session.update({
      where: { id: params.id },
      data: updateData,
      include: {
        transcript: true,
        note: true,
      },
    });

    // Update notes if provided
    if (note && Array.isArray(note)) {
      await Promise.all(
        note.map((n: { 
          id: string; 
          text: string; 
          citations: string[]; 
          needs_confirmation: boolean;
        }) =>
          prisma.noteSpan.update({
            where: { id: n.id },
            data: {
              text: n.text,
              citations: JSON.stringify(n.citations),
              needsConfirmation: n.needs_confirmation,
            },
          })
        )
      );
    }

    // Fetch updated session
    const updatedSession = await prisma.session.findUnique({
      where: { id: params.id },
      include: {
        transcript: true,
        note: true,
      },
    });

    // Transform to match frontend format
    const transformed = {
      id: updatedSession!.id,
      patient_name: updatedSession!.patientName,
      session_date: updatedSession!.sessionDate.toISOString().split('T')[0],
      signed: updatedSession!.signed,
      signed_at: updatedSession!.signedAt?.toISOString(),
      transcript: updatedSession!.transcript.map((t) => ({
        id: t.id,
        speaker: t.speaker as 'clinician' | 'patient',
        text: t.text,
        start_ms: t.startMs,
        end_ms: t.endMs,
      })),
      note: updatedSession!.note.map((n) => ({
        id: n.id,
        section: n.section as 'subjective' | 'objective' | 'assessment' | 'plan',
        text: n.text,
        citations: JSON.parse(n.citations),
        needs_confirmation: n.needsConfirmation,
      })),
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE session
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.session.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}

