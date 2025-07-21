import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Masonry from "react-masonry-css";
import Navbar from "../components/user/Navbar";
import dynamic from "next/dynamic";
import supabase from "@/lib/supabaseClient";
import Image from "next/image";
import Footer from "../components/user/Footer";

const HeroSlider = dynamic(() => import("@/components/user/HeroSlider"), { ssr: false });

export default function UserPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(9); // Default for large screens
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("name");
      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .select("id, name, price, description, category, images, discount, video, purchase_count")
        .order('purchase_count', { ascending: false });

      if (catError) console.error("Category fetch error:", catError);
      if (prodError) console.error("Product fetch error:", prodError);

      if (catData) {
        const uniqueCats = [...new Set(catData.map((c) => c.name))];
        setCategories(uniqueCats);
      }
      if (prodData) {
        setProducts(prodData);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Responsive products per page
  useEffect(() => {
    function updateProductsPerPage() {
      if (window.innerWidth < 640) {
        setProductsPerPage(21); // sm
      } else if (window.innerWidth < 1024) {
        setProductsPerPage(35); // md
      } else {
        setProductsPerPage(49); // lg and up
      }
    }
    updateProductsPerPage();
    window.addEventListener("resize", updateProductsPerPage);
    return () => window.removeEventListener("resize", updateProductsPerPage);
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters/search change
  }, [selectedCategory, debouncedSearchQuery, productsPerPage]);

  const filteredProducts = useMemo(() => products.filter((p) => {
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesSearch = p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [products, selectedCategory, debouncedSearchQuery]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleViewProduct = (product) => {
    router.push({
      pathname: "/product/[id]",
      query: { id: product.id || product.name, data: JSON.stringify(product) },
    });
  };

  const breakpointColumnsObj = {
    default: 3,
    1024: 2,
    640: 1,
  };

  return (
    <div>
      <Navbar onToggleSidebar={() => setShowSidebar(!showSidebar)} />

      <div className="flex min-h-screen text-white max-w-[1900px] mx-auto pt-16">
        {/* Sidebar */}
        <div
          className={`fixed top-16 left-0 md:static bg-gray-900 md:bg-transparent h-[calc(100vh-4rem)] w-60 p-4 transition-transform transform ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 z-30 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto md:block`}
          style={{ maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}
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
                      background: "linear-gradient(to right, #000428, #004e92, #000428)",
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
                        background: "linear-gradient(to right, #000428, #004e92, #000428)",
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
                    background: "linear-gradient(to right, #000428, #004e92, #000428)",
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
                background: "linear-gradient(to right, #000428, #004e92, #000428)",
              }}
            />
          </div>

          <div className="w-full md:max-w-full mb-8">
            <HeroSlider />
          </div>

          {loading ? (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-800 animate-pulse rounded h-[340px]" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 md:gap-4">
                {paginatedProducts.map((prod, index) => (
                  <div
                    key={index}
                    onClick={() => handleViewProduct(prod)}
                    className="bg-gray-800 border border-gray-700 rounded shadow hover:shadow-lg transition cursor-pointer flex flex-col"
                    style={{
                      background: "linear-gradient(to right, #000428, #004e92, #000428)",
                      maxHeight: "340px",
                    }}
                  >
                    {prod.images && prod.images.length > 0 && (
                      <Image
                        src={prod.images[0]}
                        alt={prod.name || "Product image"}
                        width={300}
                        height={160}
                        className="h-[100px] md:h-[160px] object-cover rounded-t"
                        priority={index < 8}
                      />
                    )}
                    <div className="p-1 flex-1 flex flex-col">
                      <div>
                        <h3 className="font-semibold text-base truncate">{prod.name}</h3>
                        <p className="text-gray-400 text-xs line-clamp-2">{prod.description}</p>
                        <p className="text-gray-400 text-xs">
                          {prod.purchase_count || 0} {prod.purchase_count === 1 ? 'purchase' : 'purchases'}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-sm">Rs{prod.price}</p>
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded w-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProduct(prod);
                          }}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400">No products found.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}