import { NextRequest, NextResponse } from "next/server";

const WEATHER_API_KEY = process.env.WEATHERAPI_KEY || "b260a7e6aae54b64baf45903262411";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "Ludhiana";
    const days = searchParams.get("days") || "7";

    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
      q
    )}&days=${days}&aqi=no&alerts=yes`;

    const res = await fetch(apiUrl, {
      next: { revalidate: 300 }, // cache for 5 minutes
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: "Weather API error", details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
