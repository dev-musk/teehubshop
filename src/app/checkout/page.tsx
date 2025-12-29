"use client";

import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Add loading state
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
  });

  // Auto-fill user data if logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setForm((prev) => ({
        ...prev,
        name: userData.name || "",
        phone: userData.phone || "",
        address: userData.address || "",
      }));
    }
  }, []);

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.regularPrice || 0) * item.quantity,
    0
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // WordPress/WooCommerce order data structure
    const orderData = {
      payment_method: "cod",
      payment_method_title: "Cash on Delivery",
      set_paid: false,
      billing: {
        first_name: form.name.split(" ")[0] || "",
        last_name: form.name.split(" ").slice(1).join(" ") || "",
        address_1: form.address,
        address_2: "",
        city: form.city,
        state: "",
        postcode: form.pincode,
        country: "IN",
        email: form.email,
        phone: form.phone,
      },
      shipping: {
        first_name: form.name.split(" ")[0] || "",
        last_name: form.name.split(" ").slice(1).join(" ") || "",
        address_1: form.address,
        address_2: "",
        city: form.city,
        state: "",
        postcode: form.pincode,
        country: "IN",
      },
      line_items: cartItems.map((item) => ({
        product_id: parseInt(item.id),
        quantity: item.quantity,
      })),
      shipping_lines: [
        {
          method_id: "flat_rate",
          method_title: "Free Shipping",
          total: "0.00",
        },
      ],
    };

    try {
      // ✅ Use Next.js API route instead of direct WordPress call
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Order creation failed:", data);
        throw new Error(data.error || "Failed to create order");
      }

      console.log("✅ Order created:", data.id);
      toast.success(`Order #${data.id} placed successfully!`);
      clearCart();
      
      // Redirect to orders page after 1.5 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (code === "SAVE10") {
      setDiscount(subtotal * 0.1);
      setCouponMessage("✅ Coupon applied! You saved 10%");
    } else if (code === "FREESHIP") {
      setDiscount(0);
      setCouponMessage("🚚 Free shipping applied!");
    } else {
      setDiscount(0);
      setCouponMessage("❌ Invalid coupon code");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500">
          Your cart is empty.{" "}
          <Link href="/" className="text-orange-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Details */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Billing Details</h2>

            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <textarea
              name="address"
              placeholder="Full Address"
              value={form.address}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border rounded-lg px-3 py-2 h-24 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full border rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full border rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* ✅ Updated button with loading state */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          {/* Order Summary */}
          <div className="border-[0.5px] border-[#C7CBD4] rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <ul className="divide-y">
              {cartItems.map((item) => (
                <li key={item.slug} className="py-3 flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>₹{(item.regularPrice || 0) * item.quantity}</span>
                </li>
              ))}
            </ul>

            {/* Coupon Code */}
            <div className="mb-4 mt-4">
              <h4 className="text-sm font-semibold mb-2">Have a Coupon?</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  disabled={loading}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={loading}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className="text-sm mt-2 text-gray-600">{couponMessage}</p>
              )}
            </div>

            <div className="flex justify-between mt-4 border-t pt-4 font-semibold">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between mt-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600 mt-2">
                <span>Discount</span>
                <span>- ₹{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between mt-4 text-lg font-bold border-t pt-4">
              <span>Total</span>
              <span>₹{(subtotal - discount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}