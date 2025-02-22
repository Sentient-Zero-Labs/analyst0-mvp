import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/app/contact-us/actions';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await sendContactEmail(formData);
    
    return NextResponse.json(result);
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 