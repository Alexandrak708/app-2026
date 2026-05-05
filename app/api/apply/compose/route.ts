export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { universityId, fullName, currentSchool, program, statement } = body ?? {};

    if (!universityId || !fullName || !currentSchool || !program || !statement) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // This is a stubbed handler. Integrate with Supabase or an email service here.
    // For now return a friendly acknowledgement and echo the submitted payload (excluding statement for privacy).
    return new Response(
      JSON.stringify({ success: true, message: 'Application received', data: { universityId, fullName, currentSchool, program } }),
      { status: 200 },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Invalid request' }), { status: 400 });
  }
}
