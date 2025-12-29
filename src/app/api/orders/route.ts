import { NextResponse } from "next/server";

const WC_API = "https://teehubshop.com/wp-json/wc/v3/orders";
const WC_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY!;
const WC_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET!;

export async function POST(req: Request) {
  try {
    const orderData = await req.json();

    const params = new URLSearchParams({
      consumer_key: WC_KEY,
      consumer_secret: WC_SECRET,
    });

    const url = `${WC_API}?${params.toString()}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Next.js App",
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Order creation failed:", data);
      return NextResponse.json(
        { 
          error: data.message || "Failed to create order",
          details: data 
        },
        { status: res.status }
      );
    }

    console.log("✅ Order created:", data.id);
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Orders API Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ FIXED: Get orders with proper email filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    const params = new URLSearchParams({
      consumer_key: WC_KEY,
      consumer_secret: WC_SECRET,
      per_page: "100", // Fetch more orders
      orderby: "date",
      order: "desc",
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
      console.error("Orders fetch error:", res.status);
      return NextResponse.json([]);
    }

    let orders = await res.json();
    
    // ✅ Filter by email on server-side since WooCommerce doesn't support it directly
    if (email) {
      orders = orders.filter((order: any) => 
        order.billing?.email?.toLowerCase() === email.toLowerCase()
      );
    }

    console.log("✅ Fetched orders:", orders.length, "for email:", email);
    return NextResponse.json(orders);
  } catch (err) {
    console.error("❌ Orders API Error:", err);
    return NextResponse.json([]);
  }
}