import axios from 'axios';
import { NextResponse } from "next/server";

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get('url');

  try {
    const response = await axios.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return NextResponse.json({ ...response.data }, { status: response.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
export async function POST(req) {
  const body = await req.json()
  const { prompt } = body?.input;

  const data = {
    input: {
      prompt,
    },
  };

  try {
    const response = await axios.post(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
      data,
      {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return NextResponse.json({ ...response.data }, { status: response.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
