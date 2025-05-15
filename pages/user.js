import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Masonry from "react-masonry-css";
import { useRouter } from "next/router";
import HeroSlider from "@/components/HeroSlider";

export default function UserPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedCategories = JSON.parse(
      localStorage.getItem("categories") || "[]"
    );
    const storedProducts = JSON.parse(localStorage.getItem("products") || "[]");
    setCategories(storedCategories);
    setProducts(storedProducts);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory
      ? p.category === selectedCategory
      : true;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const breakpointColumnsObj = {
    default: 3,
    1024: 2,
    640: 1,
  };

  const handleViewProduct = (product) => {
    router.push({
      pathname: "/product/[id]",
      query: { id: product.id || product.name, data: JSON.stringify(product) },
    });
  };

  return (
    <div>
      <Navbar onToggleSidebar={() => setShowSidebar(!showSidebar)} />

      <div className="flex min-h-screen text-white max-w-[1900px] mx-auto">
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 md:static bg-gray-900 md:bg-transparent h-full w-60 p-4 transition-transform transform ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 z-30`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Categories</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="md:hidden text-white p-1 rounded hover:bg-gray-700"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-2">
            <li
              onClick={() => setSelectedCategory("")}
              className={`cursor-pointer px-2 py-1 rounded ${
                selectedCategory === ""
                  ? "text-white font-semibold"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
              style={
                selectedCategory === ""
                  ? {
                      background:
                        "linear-gradient(to right, #000428, #004e92, #000428)",
                    }
                  : {}
              }
            >
              All
            </li>
            {categories.map((cat, index) => (
              <li
                key={index}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer px-2 py-1 rounded ${
                  selectedCategory === cat
                    ? "text-white font-semibold"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
                style={
                  selectedCategory === cat
                    ? {
                        background:
                          "linear-gradient(to right, #000428, #004e92, #000428)",
                      }
                    : {}
                }
              >
                {cat}
              </li>
            ))}
            <li className="mt-6 md:hidden">
              <Link href="/login">
                <button
                  className="w-full text-white px-4 py-1 rounded hover:shadow-md hover:-translate-y-0.5 transition"
                  style={{
                    background:
                      "linear-gradient(to right, #000428, #004e92, #000428)",
                  }}
                >
                  Admin Login
                </button>
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile overlay */}
        {showSidebar && (
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-x-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold">Welcome to Adil's Shop</h1>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-1/3 p-2 rounded text-white placeholder-gray-400 hover:placeholder-white focus:outline-none"
              style={{
                background:
                  "linear-gradient(to right, #000428, #004e92, #000428)",
              }}
            />
          </div>

          {/* HeroSlider container ensuring full width and responsive */}
          <div className="w-full md:max-w-full mb-8">
            <HeroSlider />
          </div>

          {filteredProducts.length > 0 ? (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex w-auto gap-4"
              columnClassName="masonry-column"
            >
              {filteredProducts.map((prod, index) => (
                <div
                  key={index}
                  onClick={() => handleViewProduct(prod)}
                  className="bg-gray-800 border border-gray-700 rounded shadow hover:shadow-lg transition mb-4 cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(to right, #000428, #004e92, #000428)",
                  }}
                >
                  {prod.images && prod.images.length > 0 && (
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-auto object-cover rounded-t"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{prod.name}</h3>
                    <p className="text-gray-400 text-sm">{prod.description}</p>
                    <p className="font-bold mt-2">${prod.price}</p>
                    <button
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(prod);
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </Masonry>
          ) : (
            <p className="text-gray-400">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

