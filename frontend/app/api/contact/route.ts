import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, token } = body;

    // 1. (選擇性) 在這裡可以在 Server 端驗證 Google ReCAPTCHA
    // 如果你只需要把 token 傳給 n8n 讓 n8n 驗證，這步可以跳過

    // 2. 轉發給 n8n Webhook
    // 請將下面的 URL 換成你實際的 n8n webhook URL
    const N8N_WEBHOOK_URL = 'http://myn8n.australiaeast.cloudapp.azure.com:5678/webhook/contact-form'; 

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        message,
        token, // 把 token 也傳給 n8n
        created_at: new Date().toISOString(),
      }),
    });

    if (!n8nResponse.ok) {
        // 就算 n8n 失敗，通常為了使用者體驗我們會回傳成功，除非是很嚴重的錯誤
        console.error('Failed to send to n8n');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}