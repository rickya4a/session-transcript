import { PrismaClient } from '@prisma/client';
import { mockSession } from '../data/mockSession';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.noteSpan.deleteMany();
  await prisma.transcriptSegment.deleteMany();
  await prisma.session.deleteMany();

  // Create session with transcript and notes
  const session = await prisma.session.create({
    data: {
      patientName: mockSession.patient_name,
      sessionDate: new Date(mockSession.session_date),
      signed: mockSession.signed,
      signedAt: mockSession.signed_at ? new Date(mockSession.signed_at) : null,
      transcript: {
        create: mockSession.transcript.map((t) => ({
          id: t.id,
          speaker: t.speaker,
          text: t.text,
          startMs: t.start_ms,
          endMs: t.end_ms,
        })),
      },
      note: {
        create: mockSession.note.map((n) => ({
          id: n.id,
          section: n.section,
          text: n.text,
          citations: JSON.stringify(n.citations),
          needsConfirmation: n.needs_confirmation,
        })),
      },
    },
  });

  console.log('Created session:', session.id);
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

