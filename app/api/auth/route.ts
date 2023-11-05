import { AllowedEmails } from '@/app/config';
import { NextRequest, NextResponse } from 'next/server';
import { authenticator } from 'otplib';

const totpSecret = process.env.TOTP_SECRET;

export async function POST(req: NextRequest) {
  const accessToken = req.headers.get("Authorization");

  if (accessToken === null || accessToken.length === 0) {
    return NextResponse.json(
      {
        "msg": "Missing headers",
        "required": [
          "Authorization"
        ]
      },
      {
        status: 400
      }
    );
  }

  const res = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    }
  );
  const resBody = await res.json();

  if (res.status === 401) {
    return NextResponse.json(
      {
        "msg": "Invalid Credentials"
      },
      {
        status: 401
      }
    );
  } else if (res.status !== 200 || !resBody.hasOwnProperty("email")) {
    return NextResponse.json(
      {
        "msg": "Unknown error"
      },
      {
        status: 500
      }
    );
  }

  if (!AllowedEmails.includes(resBody.email)) {
    return NextResponse.json(
      {
        "msg": "Email unauthorized"
      },
      {
        status: 403
      }
    );
  }

  return NextResponse.json({ code: authenticator.generate(totpSecret) });
}
