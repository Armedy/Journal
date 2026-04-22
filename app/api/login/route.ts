import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === process.env.JOURNAL_PASSWORD) {
    const response = NextResponse.json({ success: true });
    
    // Set a cookie that expires in 10 minutes (600 seconds)
    response.cookies.set('journal_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_SETTING === 'production',
      maxAge: 600, 
      path: '/',
    });

    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}