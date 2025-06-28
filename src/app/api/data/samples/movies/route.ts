import { NextResponse } from 'next/server';
import { movies } from '@/shared/server/database/samples/movies/movies';

export const GET = async () => {
  try {
    return NextResponse.json(movies);
  } catch (error) {
    return NextResponse.json({ error: `Failed to Get Movies` }, { status: 500 });
  }
};