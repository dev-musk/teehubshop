"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface WooCommerceOrder {
  id: number;
  number: string;
  status: string;
  total: string;
  date_created: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    total: string;
    product_id: number;
    image?: {
      src: string;
    };
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<WooCommerceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string>("");

  // Get user email from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserEmail(parsed.email || "");
    }
  }, []);

  // Fetch orders from WooCommerce
  useEffect(() => {
    if (!userEmail) return;

    const fetchOrders = async () => {
      try {
        // Fetch from our Next.js API route
        const res = await fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`);

        if (!res.ok) {
          throw new Error("Failed to load orders");
        }

        const ordersData = await res.json();
        console.log("✅ Loaded orders:", ordersData.length);
        setOrders(ordersData);
      } catch (err) {
        console.error("❌ Error loading orders:", err);
        setError("Unable to load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userEmail]);

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "on-hold":
        return "bg-orange-100 text-orange-700";
      case "cancelled":
      case "refunded":
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 mt-10 p-4 bg-red-50 rounded-lg max-w-2xl mx-auto">
        {error}
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="text-center mt-10 text-gray-600">
        <p className="mb-4">Please log in to view your orders.</p>
        <Link href="/login" className="text-orange-600 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-600 max-w-md mx-auto p-8 bg-gray-50 rounded-lg">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <p className="text-lg mb-2">No orders yet</p>
        <p className="text-sm text-gray-500 mb-4">
          Start shopping to see your orders here!
        </p>
        <Link
          href="/"
          className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
        <p className="text-gray-600">
          {orders.length} {orders.length === 1 ? "order" : "orders"} found
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow"
          >
            {/* Order Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Order #{order.number}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {new Date(order.date_created).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {order.line_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0"
                >
                  {/* Product Image Placeholder */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {item.image?.src ? (
                      <Image
                        unoptimized
                        src={item.image.src}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full rounded-lg"
                      />
                    ) : (
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-1">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      ₹{parseFloat(item.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium">Shipped to:</span>{" "}
                  {order.billing.first_name} {order.billing.last_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{parseFloat(order.total).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
              <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Track Order
              </button>
              <button className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                Reorder
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}