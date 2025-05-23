import { useState } from "react";
import Link from "next/link";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailto = `mailto:adilameeradi@gmail.com?subject=${encodeURIComponent(form.subject || "Website Feedback")}&body=${encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    )}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center px-4 py-12 relative">
      {/* Back to Home Button */}
      <Link
        href="/user"
        className="fixed top-4 right-4 md:absolute md:top-6 md:right-6 z-10 group"
        style={{ minWidth: 0 }}
      >
        <span className="inline-flex items-center gap-2 bg-red-600 hover:bg-blue-700 text-white px-2 py-2 md:px-4 md:py-2 rounded-full shadow transition-colors font-semibold text-xs md:text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden xs:inline">Back to Home</span>
        </span>
      </Link>
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Contact Us</h1>
        <p className="text-gray-600 mb-6 text-center">Have a suggestion or complaint? Fill out the form below and your message will be sent to our team. We value your feedback!</p>
        {submitted ? (
          <div className="text-green-600 text-center font-semibold py-8">
            Thank you for your feedback! Your email client should have opened. If not, please send your message to <a href="mailto:adilameer@gmail.com" className="text-blue-600 underline">adilameer@gmail.com</a>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black"
                placeholder="Suggestion, Complaint, etc."
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black"
                rows={5}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded transition-colors shadow"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 