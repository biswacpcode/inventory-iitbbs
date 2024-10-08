import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if (user) {
    return NextResponse.json({ user }, { status: 200 });
  } else {
    return NextResponse.json({ user: undefined }, { status: 200 });
  }
}
