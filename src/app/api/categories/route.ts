import { NextResponse } from "next/server";

const WC_API = "https://teehubshop.com/wp-json/wc/v3/products/categories";
const WC_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY!;
const WC_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET!;

export async function GET() {
  try {
    const params = new URLSearchParams({
      consumer_key: WC_KEY,
      consumer_secret: WC_SECRET,
      per_page: "100",
      hide_empty: "true",
    });

    const url = `${WC_API}?${params.toString()}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Next.js App",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error("Categories API Error:", res.status, res.statusText);
      return NextResponse.json([]);
    }

    const data = await res.json();
    
    const categories = data
      .filter((cat: any) => cat.count > 0)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10)
      .map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat.count,
        image: cat.image?.src || null,
      }));

    console.log("✅ Fetched categories:", categories.length);
    return NextResponse.json(categories);
  } catch (err) {
    console.error("❌ Categories API Error:", err);
    return NextResponse.json([]);
  }
}