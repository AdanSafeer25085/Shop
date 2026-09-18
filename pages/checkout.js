import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const STEPS = ["Details", "Payment", "Confirm"];

export default function Checkout() {
  const router = useRouter();
  // product/[id].js sends flat params: name, price, discountedPrice, image
  const { name, price, discountedPrice, image } = router.query;

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    location: "",
    paymentMethod: "",
  });
  const [paymentNumber, setPaymentNumber] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (formData.paymentMethod === "easypaisa") {
      setPaymentNumber("03439200329");
    } else if (formData.paymentMethod === "jazzcash") {
      setPaymentNumber("03278625085");
    } else {
      setPaymentNumber("");
    }
  }, [formData.paymentMethod]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.customerName.trim()) errors.customerName = "Full name is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.paymentMethod) errors.paymentMethod = "Please select a payment method";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const finalPrice = discountedPrice && discountedPrice !== price ? discountedPrice : price;
    const message =
      `*🛍️ New Order — TrendyNest*\n\n` +
      `*Product:* ${name}\n` +
      `*Price:* Rs ${finalPrice}\n\n` +
      `*Customer Details:*\n` +
      `Name: ${formData.customerName}\n` +
      `Phone: ${formData.phone}\n` +
      `Address: ${formData.address}\n` +
      `${formData.location ? `Landmark: ${formData.location}\n` : ""}` +
      `Payment: ${formData.paymentMethod.toUpperCase()}` +
      `${paymentNumber ? `\n\n*Send payment to:* ${paymentNumber}\nAccount Name: Adan Safeer\n\n📷 Please send a screenshot of your payment.` : ""}`;

    const url = `https://wa.me/923124165364?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setSubmitted(true);
  };

  // Guard: no product info
  if (router.isReady && !name) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(to bottom, #000428, #001a4a)" }}
      >
        <div className="text-center text-white">
          <span className="text-5xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-bold mb-2">No product selected</h2>
          <p className="text-white/50 mb-6">Please select a product from the shop first.</p>
          <Link href="/user">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">
              Go to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(to bottom, #000428, #001a4a)" }}
      >
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6 animate-bounce">🎉</div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Order Sent!</h2>
          <p className="text-white/60 mb-2">
            Your order for <span className="text-white font-semibold">{name}</span> has been sent to WhatsApp.
          </p>
          <p className="text-white/40 text-sm mb-8">
            We will contact you shortly to confirm your order. Thank you for shopping with TrendyNest! 🛍️
          </p>
          <Link href="/user">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5">
              Continue Shopping →
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ background: "linear-gradient(to bottom, #000428, #001a4a)" }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link href="/user">
          <button className="mb-6 flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
            ← Back to Shop
          </button>
        </Link>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                    i < step
                      ? "bg-green-500 border-green-500 text-white"
                      : i === step
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/40"
                      : "bg-transparent border-white/20 text-white/30"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={`text-xs mt-1 font-medium ${
                    i === step ? "text-blue-400" : "text-white/30"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-16 sm:w-24 mx-1 mb-5 transition-all duration-300 ${
                    i < step ? "bg-green-500" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* ── Left: Product Summary ────────────────────────────────────── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
              Order Summary
            </h2>
            {image && (
              <div className="rounded-xl overflow-hidden mb-4">
                <Image
                  src={image}
                  alt={name || "Product"}
                  width={500}
                  height={350}
                  className="w-full h-52 object-cover"
                />
              </div>
            )}
            <h3 className="text-xl font-bold text-white mb-3">{name}</h3>

            {discountedPrice && discountedPrice !== price ? (
              <div className="flex items-center gap-3">
                <span className="text-white/40 line-through text-lg">Rs {price}</span>
                <span className="text-green-400 font-extrabold text-2xl">Rs {discountedPrice}</span>
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-md font-bold">SALE</span>
              </div>
            ) : (
              <span className="text-green-400 font-extrabold text-2xl">Rs {price}</span>
            )}

            <div className="border-t border-white/10 mt-4 pt-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white">Rs {discountedPrice || price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Delivery</span>
                <span className="text-green-400 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-2 mt-2">
                <span className="text-white">Total</span>
                <span className="text-green-400 text-lg">Rs {discountedPrice || price}</span>
              </div>
            </div>
          </div>

          {/* ── Right: Checkout Form ─────────────────────────────────────── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-5">
              Delivery & Payment
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  placeholder="e.g. Ali Ahmed"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    borderColor: formErrors.customerName ? "#ef4444" : "rgba(255,255,255,0.12)",
                  }}
                />
                {formErrors.customerName && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.customerName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="03XX-XXXXXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    borderColor: formErrors.phone ? "#ef4444" : "rgba(255,255,255,0.12)",
                    border: "1px solid",
                  }}
                />
                {formErrors.phone && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">
                  Complete Address *
                </label>
                <textarea
                  name="address"
                  placeholder="House #, Street, Area, City"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    borderColor: formErrors.address ? "#ef4444" : "rgba(255,255,255,0.12)",
                    border: "1px solid",
                  }}
                />
                {formErrors.address && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.address}</p>
                )}
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">
                  Nearest Landmark <span className="text-white/30">(optional)</span>
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Near Blue Area, near McDonald's"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">
                  Payment Method *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "cod", icon: "💵", label: "Cash on Delivery" },
                    { value: "easypaisa", icon: "📱", label: "EasyPaisa" },
                    { value: "jazzcash", icon: "📲", label: "JazzCash" },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, paymentMethod: method.value }));
                        setFormErrors((prev) => ({ ...prev, paymentMethod: "" }));
                      }}
                      className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-medium transition-all duration-200 ${
                        formData.paymentMethod === method.value
                          ? "border-blue-500 bg-blue-500/20 text-white shadow-lg shadow-blue-500/20"
                          : "border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <span className="leading-tight text-center">{method.label}</span>
                    </button>
                  ))}
                </div>
                {formErrors.paymentMethod && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.paymentMethod}</p>
                )}
              </div>

              {/* Payment number card */}
              {paymentNumber && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-yellow-300 text-sm font-semibold mb-1">
                    📲 Send payment to:
                  </p>
                  <p className="text-white font-bold text-lg tracking-widest">{paymentNumber}</p>
                  <p className="text-yellow-200/70 text-xs mt-0.5">Account Name: Adan Safeer</p>
                  <p className="text-yellow-200/50 text-xs mt-2">
                    After payment, send a screenshot on WhatsApp when ordering.
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-base transition-all duration-200 shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-3"
              >
                <span>💬</span>
                Order on WhatsApp
              </button>
              <p className="text-center text-white/30 text-xs">
                Clicking will open WhatsApp with your order details pre-filled.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
