import { SessionView } from '@/components/SessionView';
import { prisma } from '@/lib/prisma';

async function getLatestSession() {
  const session = await prisma.session.findFirst({
    include: {
      transcript: true,
      note: true,
    },
    orderBy: {
      sessionDate: 'desc',
    },
  });

  if (!session) {
    return null;
  }

  // Transform to match frontend format
  return {
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
}

export default async function Home() {
  const session = await getLatestSession();

  if (!session) {
    return (
      <main className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Sessions Found</h1>
          <p className="text-muted-foreground">
            Run <code className="bg-muted px-2 py-1 rounded">npm run db:seed</code> to create sample data
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen">
      <SessionView session={session} />
    </main>
  );
}
