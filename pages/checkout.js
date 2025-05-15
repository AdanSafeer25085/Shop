import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Checkout() {
  const router = useRouter();
  const { product: productQuery } = router.query;
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    location: "",
    paymentMethod: "",
  });
  const [paymentNumber, setPaymentNumber] = useState("");

  useEffect(() => {
    if (router.isReady && productQuery) {
      try {
        const decoded = decodeURIComponent(productQuery);
        setProduct(JSON.parse(decoded));
      } catch (err) {
        console.error("Failed to parse product data:", err);
      }
    }
  }, [router.isReady, productQuery]);

  useEffect(() => {
    if (formData.paymentMethod === "easypaisa") {
      setPaymentNumber("03007029003");
    } else if (formData.paymentMethod === "jazzcash") {
      setPaymentNumber("03007029003");
    } else {
      setPaymentNumber("");
    }
  }, [formData.paymentMethod]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrder = () => {
    const message = `*Order Details*\n\nProduct: ${product.name}\nPrice: $${product.price}\n\n*Customer Info:*\nName: ${formData.name}\nPhone: ${formData.phone}\nAddress: ${formData.address}\nLocation: ${formData.location}\nPayment Method: ${formData.paymentMethod.toUpperCase()}${paymentNumber ? `\n\nPayment To: ${paymentNumber}\n📷 *Please send a screenshot of your payment after completing the transaction.*` : ""}`;
    const url = `https://wa.me/923007029003?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center items-center">
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center items-center">
      <div className="w-full max-w-6xl bg-gray-800 rounded shadow p-6">
        {/* Go Back Button */}
        <Link href="/user">
          <button className="mb-6 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
            ← Back to Shop
          </button>
        </Link>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {/* Left Side - Image */}
          <div className="flex-shrink-0 w-full md:w-1/2">
            {product.images && product.images[0] && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-auto rounded"
              />
            )}
          </div>

          {/* Right Side - Details + Form */}
          <div className="flex-1 space-y-4 w-full">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-300">{product.description}</p>
            <p className="text-green-400 font-bold text-xl">${product.price}</p>

            <div className="space-y-3 mt-6">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
              <textarea
                name="address"
                placeholder="Complete Address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              ></textarea>
              <input
                type="text"
                name="location"
                placeholder="Location Marker / Landmark"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />

              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              >
                <option value="">Select Payment Method</option>
                <option value="cod">Cash on Delivery</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="jazzcash">JazzCash</option>
              </select>

              {paymentNumber && (
                <p className="text-yellow-300 font-semibold">
                  Send payment to: {paymentNumber}
                  <br />
                  Name: Adil Ameer
                </p>
                
              )}

              <button
                onClick={handleOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
