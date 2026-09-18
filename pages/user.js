import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/user/Navbar";
import dynamic from "next/dynamic";
import supabase from "@/lib/supabaseClient";
import Image from "next/image";
import Footer from "../components/user/Footer";

const HeroSlider = dynamic(() => import("@/components/user/HeroSlider"), {
  ssr: false,
});

// ── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skeleton rounded-xl h-[280px] md:h-[320px]" />
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl mb-4">🔍</span>
      <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
      <p className="text-white/50 text-sm max-w-xs">
        {query
          ? `No results for "${query}". Try a different search.`
          : "No products in this category yet. Check back soon!"}
      </p>
    </div>
  );
}

// ── Is "new" (added in last 7 days) ─────────────────────────────────────────
function isNew(created_at) {
  if (!created_at) return false;
  const diff = Date.now() - new Date(created_at).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}

export default function UserPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(18);
  const router = useRouter();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("name");
      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .select(
          "id, name, price, description, category, images, discount, video, purchase_count, created_at"
        )
        .order("purchase_count", { ascending: false });

      if (catError) console.error("Category fetch error:", catError);
      if (prodError) console.error("Product fetch error:", prodError);

      if (catData) setCategories([...new Set(catData.map((c) => c.name))]);
      if (prodData) setProducts(prodData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Responsive products per page
  useEffect(() => {
    function update() {
      if (window.innerWidth < 640) setProductsPerPage(12);
      else if (window.innerWidth < 1024) setProductsPerPage(20);
      else setProductsPerPage(28);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearchQuery, productsPerPage]);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchesCategory = selectedCategory
          ? p.category === selectedCategory
          : true;
        const matchesSearch = p.name
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [products, selectedCategory, debouncedSearchQuery]
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleViewProduct = (product) => {
    router.push({
      pathname: "/product/[id]",
      query: { id: product.id, data: JSON.stringify(product) },
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(to bottom, #000428, #001a4a)" }}
    >
      <Navbar onToggleSidebar={() => setShowSidebar(!showSidebar)} />

      <div className="flex max-w-[1900px] mx-auto pt-16">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside
          className={`fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-56 p-5 transition-transform duration-300 overflow-y-auto
            md:sticky md:translate-x-0 md:block
            ${showSidebar ? "translate-x-0" : "-translate-x-full"}
          `}
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,4,40,0.97), rgba(0,30,80,0.97))",
            borderRight: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest">
              Categories
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="md:hidden text-white/60 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>

          <ul className="space-y-1">
            {/* All */}
            <li>
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === ""
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                🏷️ All Products
              </button>
            </li>

            {categories.map((cat, index) => (
              <li key={index}>
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              </li>
            ))}

            {/* Admin login (mobile only) */}
            <li className="mt-8 md:hidden">
              <Link href="/login">
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/10 transition">
                  ⚙️ Admin Login
                </button>
              </Link>
            </li>
          </ul>
        </aside>

        {/* Sidebar overlay (mobile) */}
        {showSidebar && (
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          />
        )}

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden min-w-0">
          {/* Top bar: title + search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Welcome to TrendyNest
              </h1>
              <p className="text-white/40 text-sm mt-0.5">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/40 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              />
            </div>
          </div>

          {/* Hero Slider */}
          <div className="mb-8">
            <HeroSlider />
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {Array.from({ length: 14 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
                {paginatedProducts.map((prod, index) => {
                  const discountedPrice =
                    prod.discount > 0
                      ? prod.price - (prod.price * prod.discount) / 100
                      : null;
                  const newItem = isNew(prod.created_at);

                  return (
                    <div
                      key={prod.id || index}
                      onClick={() => handleViewProduct(prod)}
                      className="product-card group relative rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 flex flex-col"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(0,4,40,0.9), rgba(0,60,120,0.85))",
                        maxHeight: "320px",
                      }}
                    >
                      {/* Badges */}
                      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                        {prod.discount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
                            -{prod.discount}%
                          </span>
                        )}
                        {newItem && (
                          <span className="badge-new bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
                            NEW
                          </span>
                        )}
                      </div>

                      {/* Image */}
                      {prod.images && prod.images.length > 0 ? (
                        <div className="overflow-hidden h-[100px] md:h-[160px] flex-shrink-0">
                          <Image
                            src={prod.images[0]}
                            alt={prod.name || "Product image"}
                            width={300}
                            height={160}
                            className="product-card-img w-full h-full object-cover"
                            priority={index < 7}
                          />
                        </div>
                      ) : (
                        <div className="h-[100px] md:h-[160px] flex-shrink-0 flex items-center justify-center bg-white/5">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}

                      {/* Info */}
                      <div className="p-2 flex flex-col flex-1 gap-1">
                        <h3 className="font-semibold text-xs sm:text-sm text-white truncate leading-tight">
                          {prod.name}
                        </h3>
                        <p className="text-white/40 text-[10px] line-clamp-2 leading-snug">
                          {prod.description}
                        </p>

                        {/* Purchase count */}
                        {prod.purchase_count > 0 && (
                          <p className="text-[10px] text-orange-400 font-medium">
                            🔥 {prod.purchase_count} sold
                          </p>
                        )}

                        {/* Price */}
                        <div className="mt-auto">
                          {discountedPrice ? (
                            <div>
                              <span className="text-white/40 text-[10px] line-through">
                                Rs{prod.price}
                              </span>
                              <span className="block text-green-400 font-bold text-xs sm:text-sm">
                                Rs{discountedPrice.toFixed(0)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-white font-bold text-xs sm:text-sm">
                              Rs{prod.price}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProduct(prod);
                          }}
                          className="mt-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] sm:text-xs font-semibold py-1.5 rounded-lg w-full transition-all duration-200"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm disabled:opacity-40 hover:bg-white/20 transition-all duration-200"
                  >
                    ← Prev
                  </button>
                  <span className="text-white/60 text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm disabled:opacity-40 hover:bg-white/20 transition-all duration-200"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState query={debouncedSearchQuery} />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}