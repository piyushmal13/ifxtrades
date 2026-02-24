import { NextResponse } from "next/server";
import { getServerAuthContext } from "@/lib/auth";

export async function GET() {
  const auth = await getServerAuthContext();

  if (!auth.user) {
    return NextResponse.json(
      {
        authenticated: false,
        role: "user",
      },
      { status: 401 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    role: auth.role,
    userId: auth.user.id,
  });
}
