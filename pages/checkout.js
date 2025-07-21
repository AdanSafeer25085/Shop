import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Checkout() {
  const router = useRouter();
  const { name, price, discountedPrice, image } = router.query;
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    location: "",
    paymentMethod: "",
  });
  const [paymentNumber, setPaymentNumber] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (router.isReady && name) {
      try {
        // No need to decodeURIComponent or JSON.parse for name, price, discountedPrice, image
        // as they are directly available in router.query
      } catch (err) {
        console.error("Failed to parse product data:", err);
      }
    }
  }, [router.isReady, name]);

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
    setFormErrors((prev) => ({ ...prev, [e.target.name]: "" })); // Clear error for this field
  };

  if (!name) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center items-center">
        <p>Loading product...</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.phone) errors.phone = "Phone number is required";
    if (!formData.address) errors.address = "Address is required";
    if (!formData.location) errors.location = "Location is required";
    if (!formData.paymentMethod) errors.paymentMethod = "Payment method is required";
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      // Create order message
      const finalPrice = discountedPrice || price;
      const message = `*Order Details*\n\nProduct: ${name}\nPrice: Rs ${finalPrice}\n\n*Customer Info:*\nName: ${formData.name}\nPhone: ${formData.phone}\nAddress: ${formData.address}\nLocation: ${formData.location}\nPayment Method: ${formData.paymentMethod.toUpperCase()}${paymentNumber ? `\n\nPayment To: ${paymentNumber}\n📷 *Please send a screenshot of your payment after completing the transaction.*` : ""}`;
      
      // Open WhatsApp with order details
      const url = `https://wa.me/923124165364?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");

      // Show confirmation message to user
      alert("Please confirm your order on WhatsApp. The purchase count will be updated after order confirmation.");
      
    } catch (err) {
      console.error("Error processing order:", err);
      alert("There was an error processing your order. Please try again.");
    }
  };

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
            {image && (
              <Image
                src={image}
                alt={name || 'Product Image'}
                width={500}
                height={500}
                className="w-full h-auto rounded object-cover"
              />
            )}
          </div>

          {/* Right Side - Details + Form */}
          <div className="flex-1 space-y-4 w-full">
            <h1 className="text-3xl font-bold">{name}</h1>
            {discountedPrice && discountedPrice !== price ? (
              <div className="flex items-center gap-4">
                <p className="text-gray-400 line-through text-xl">Rs {price}</p>
                <p className="text-green-400 font-bold text-2xl">Rs {discountedPrice}</p>
              </div>
            ) : (
              <p className="text-green-400 font-bold text-2xl">Rs {price}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 mt-6">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
                {formErrors.name && (
                  <p className="text-red-400 text-xs mt-1 mb-0.5">{formErrors.name}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
                {formErrors.phone && (
                  <p className="text-red-400 text-xs mt-1 mb-0.5">{formErrors.phone}</p>
                )}
              </div>
              <div>
                <textarea
                  name="address"
                  placeholder="Complete Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                ></textarea>
                {formErrors.address && (
                  <p className="text-red-400 text-xs mt-1 mb-0.5">{formErrors.address}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="location"
                  placeholder="Location Marker / Landmark"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>
              <div>
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
                {formErrors.paymentMethod && (
                  <p className="text-red-400 text-xs mt-1 mb-0.5">{formErrors.paymentMethod}</p>
                )}
              </div>

              {paymentNumber && (
                <p className="text-yellow-300 font-semibold">
                  Send payment to: {paymentNumber}
                  <br />
                  Name: Adan Safeer
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                Order Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
