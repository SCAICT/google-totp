import { NextRequest, NextResponse } from 'next/server';

const allowedEmails = [
  "leolee50910@gmail.com"
];

export async function POST(req: NextRequest) {
  let accessToken = req.headers.get("Authorization");

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

  let res = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    }
  );
  let resBody = await res.json();

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

  if (!allowedEmails.includes(resBody.email)) {
    return NextResponse.json(
      {
        "msg": "Email unauthorized"
      },
      {
        status: 401
      }
    );
  }

  return NextResponse.json({ secret: process.env.TOTP_SECRET });
}
