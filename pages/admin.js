"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import CategoryList from "../components/admin/CategoryList";
import CategoryForm from "../components/admin/CategoryForm";
import ProductForm from "../components/admin/ProductForm";
import ProductTable from "../components/admin/ProductTable";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

// Simple client-side image optimization (resize) using canvas
const optimizeImage = (file, maxWidth = 1024, maxHeight = 1024) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          resolve(new File([blob], file.name, { type: file.type }));
        },
        file.type,
        0.8 // quality (0.8 for good compression)
      );
    };
    img.onerror = reject;
  });
};

export default function Admin() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    images: [],
    video: null,
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discounts, setDiscounts] = useState({});
  const [productSearch, setProductSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 15;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/");
  };

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from("categories").select("name");
    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order('purchase_count', { ascending: false });
      if (error) {
        console.error("Error fetching products:", error);
        return;
      }
      setProducts(data || []);
    } catch (err) {
      console.error("Unexpected error in fetchProducts:", err);
    }
  }, []);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/login");
      return;
    }

    console.log("Initial admin page load");
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchCategories(),
          fetchProducts()
        ]);
      } catch (error) {
        console.error("Error initializing admin data:", error);
      }
    };

    initializeData();
  }, [fetchCategories, fetchProducts, router]);

  const generateUniqueFilename = (fileName) => {
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${Date.now()}_${randomStr}_${fileName}`;
  };

  const validateFile = (file, type) => {
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
    const maxImageSize = 5 * 1024 * 1024; // 5 MB
    const maxVideoSize = 20 * 1024 * 1024; // 20 MB

    if (type === "image") {
      if (!allowedImageTypes.includes(file.type)) {
        alert("Invalid image type. Only JPEG, PNG, and GIF are allowed.");
        return false;
      }
      if (file.size > maxImageSize) {
        alert("Image size exceeds 5 MB limit.");
        return false;
      }
    } else if (type === "video") {
      if (!allowedVideoTypes.includes(file.type)) {
        alert("Invalid video type. Only MP4, WebM, and OGG are allowed.");
        return false;
      }
      if (file.size > maxVideoSize) {
        alert("Video size exceeds 20 MB limit.");
        return false;
      }
    }
    return true;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 4;
    const remainingSlots = maxImages - productForm.images.length;

    if (files.length > remainingSlots) {
      alert(`You can only add up to ${maxImages} images in total.`);
      return;
    }

    const uploadedImages = [];

    for (const file of files) {
      if (!validateFile(file, "image")) continue;

      let optimizedFile;
      try {
        optimizedFile = await optimizeImage(file);
      } catch (err) {
        console.error("Image optimization failed, uploading original file", err);
        optimizedFile = file;
      }

      const fileName = generateUniqueFilename(optimizedFile.name);
      const { data, error } = await supabase.storage
        .from("product-media")
        .upload(fileName, optimizedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      console.log("Upload result:", data, error);

      if (error) {
        console.error("Error uploading image:", error);
        alert("Image upload failed");
        continue;
      }
      const { data: publicUrlData, error: urlError } = supabase.storage
        .from("product-media")
        .getPublicUrl(data.path);

      console.log("Public URL result:", publicUrlData, urlError);

      if (urlError) {
        console.error("Error getting image URL:", urlError);
        alert("Getting image URL failed");
        continue;
      }
      if (publicUrlData && publicUrlData.publicUrl) {
        uploadedImages.push(publicUrlData.publicUrl);
      }
    }

    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedImages],
    }));

    e.target.value = null;
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFile(file, "video")) return;

    const fileName = generateUniqueFilename(file.name);
    const { data, error } = await supabase.storage
      .from("product-media")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (error) {
      console.error("Error uploading video:", error);
      alert("Video upload failed");
      return;
    }
    const { data: publicUrlData, error: urlError } = supabase.storage
      .from("product-media")
      .getPublicUrl(data.path);
    if (urlError) {
      console.error("Error getting video URL:", urlError);
      alert("Getting video URL failed");
      return;
    }

    if (publicUrlData && publicUrlData.publicUrl) {
      setProductForm((prev) => ({
        ...prev,
        video: publicUrlData.publicUrl,
      }));
    }

    e.target.value = null;
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    const { name, price, category } = productForm;
    if (!name.trim() || !price.trim() || !category.trim()) return;

    if (editingIndex !== null) {
      const id = products[editingIndex].id;
      const { error } = await supabase
        .from("products")
        .update(productForm)
        .eq("id", id);
      if (!error) {
        toast.success("Product updated successfully ✅");
        await fetchProducts();
        resetForm();
      } else {
        toast.error("Failed to update product");
      }
    } else {
      const { error } = await supabase.from("products").insert([productForm]);
      if (!error) {
        toast.success("Product added successfully 🎉");
        await fetchProducts();
        resetForm();
      } else {
        toast.error("Failed to add product");
      }
    }
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      price: "",
      description: "",
      category: "",
      images: [],
      video: null,
    });
    setEditingIndex(null);
  };

  const handleDeleteProduct = async (index) => {
    const id = products[index].id;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      toast.success("Product deleted successfully");
      await fetchProducts();
    } else {
      toast.error("Failed to delete product");
    }
  };

  const handleEditProduct = (index) => {
    setProductForm(products[index]);
    setEditingIndex(index);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = categoryInput.trim();
    if (!name || categories.some((cat) => cat.name === name)) {
      toast.warn("Category already exists or name is invalid.");
      return;
    }
    const { error } = await supabase.from("categories").insert([{ name }]);
    if (!error) {
      toast.success(`Category "${name}" added`);
      await fetchCategories();
      setCategoryInput("");
    } else {
      toast.error("Failed to add category");
    }
  };

  const handleDeleteCategory = async (name) => {
    const productsInCategory = products.filter((p) => p.category === name);
    const confirmed = window.confirm(
      `Delete category "${name}"?\nThis will also delete ${productsInCategory.length} product(s).`
    );
    if (!confirmed) return;

    const { error: catError } = await supabase
      .from("categories")
      .delete()
      .eq("name", name);
    const { error: prodError } = await supabase
      .from("products")
      .delete()
      .eq("category", name);

    if (!catError && !prodError) {
      toast.success(`Category "${name}" and its products deleted`);
      await fetchCategories();
      await fetchProducts();
    } else {
      toast.error("Failed to delete category");
    }
  };

  const handleDeleteImage = (idx) => {
    const updatedImages = productForm.images.filter((_, i) => i !== idx);
    setProductForm((prev) => ({ ...prev, images: updatedImages }));
  };

  const handleDeleteVideo = () => {
    setProductForm((prev) => ({ ...prev, video: null }));
  };

  const handleSelectProduct = async (id) => {
    if (selectedProducts.includes(id)) {
      // Unselecting: remove discount in DB
      await supabase.from("products").update({ discount: 0 }).eq("id", id);
      setDiscounts((prev) => {
        const newDiscounts = { ...prev };
        delete newDiscounts[id];
        return newDiscounts;
      });
      await fetchProducts();
      setSelectedProducts((prev) => prev.filter((pid) => pid !== id));
    } else {
      setSelectedProducts((prev) => [...prev, id]);
    }
  };

  const handleDiscountChange = (id, value) => {
    setDiscounts((prev) => ({ ...prev, [id]: value }));
  };

  const applyDiscount = async () => {
    if (selectedProducts.length === 0) {
      toast.warn("Select at least one product");
      return;
    }

    for (let id of selectedProducts) {
      const discount = parseFloat(discounts[id]);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        toast.warn(`Enter a valid discount (0–100) for product ID ${id}`);
        return;
      }
    }

    try {
      const { error: resetError } = await supabase
        .from("products")
        .update({ discount: 0 })
        .gte("discount", 1);

      if (resetError) throw resetError;

      for (let id of selectedProducts) {
        const discount = parseFloat(discounts[id]);
        const { error } = await supabase
          .from("products")
          .update({ discount })
          .eq("id", id);

        if (error) throw error;
      }

      toast.success("Discounts applied successfully! 🎉");
      await fetchProducts();
      setSelectedProducts([]);
      setDiscounts({});
    } catch (error) {
      console.error("Failed to apply discount:", error);
      toast.error("Failed to apply discount: " + error.message);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return products
      .filter((prod) =>
        prod.name.toLowerCase().includes(q) ||
        prod.category?.toLowerCase().includes(q) ||
        prod.description?.toLowerCase().includes(q)
      )
      .sort((a, b) => (b.purchase_count || 0) - (a.purchase_count || 0));
  }, [products, productSearch]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-white shadow-md flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="h-6 w-6 text-indigo-600" />
          </button>
          <span className="text-xl font-bold text-indigo-700 tracking-tight">Admin Dashboard</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          Logout
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black opacity-30" onClick={() => setSidebarOpen(false)}></div>
          <aside className="relative z-50 w-64 bg-white shadow-lg h-full flex flex-col p-6">
            <button className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
            <nav className="mt-10 space-y-4 flex-1 overflow-y-auto">
              <a href="#dashboard" className="block text-indigo-700 font-semibold">Dashboard</a>
              <a href="#products" className="block text-gray-700 hover:text-indigo-600">Products</a>
              <button
                onClick={() => setShowCategories((prev) => !prev)}
                className="block w-full text-left text-gray-700 hover:text-indigo-600 focus:outline-none"
              >
                Categories
              </button>
              {showCategories && (
                <div className="mt-2 max-h-60 overflow-y-auto pr-2">
                  <CategoryList categories={categories} onDelete={handleDeleteCategory} />
                  <CategoryForm value={categoryInput} onChange={e => setCategoryInput(e.target.value)} onSubmit={handleAddCategory} />
                </div>
              )}
              <button onClick={handleLogout} className="block w-full text-left text-red-600 hover:text-red-800 mt-8">Logout</button>
            </nav>
          </aside>
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <div className="flex flex-1">
        <aside className="hidden md:block fixed pt-[64px] top-0 left-0 w-64 h-[100vh] bg-white border-r border-gray-100 shadow-lg py-8 px-6 z-20 overflow-y-auto">
          <nav className="space-y-4">
            <a href="#dashboard" className="block text-indigo-700 font-semibold">Dashboard</a>
            <a href="#products" className="block text-gray-700 hover:text-indigo-600">Products</a>
            <button
              onClick={() => setShowCategories((prev) => !prev)}
              className="block w-full text-left text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              Categories
            </button>
            {showCategories && (
              <div className="mt-2">
                <CategoryList categories={categories} onDelete={handleDeleteCategory} />
                <CategoryForm value={categoryInput} onChange={e => setCategoryInput(e.target.value)} onSubmit={handleAddCategory} />
              </div>
            )}
            <button onClick={handleLogout} className="block w-full text-left text-red-600 hover:text-red-800 mt-8">Logout</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full md:ml-64">
          {/* Dashboard Section */}
          <section id="dashboard" className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-4">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome, Admin! 👋</h1>
              <p className="text-gray-500 text-sm">Manage your products and categories from this dashboard.</p>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Products",
                  value: products.length,
                  icon: "📦",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  label: "Categories",
                  value: categories.length,
                  icon: "🏷️",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  label: "On Sale",
                  value: products.filter((p) => p.discount > 0).length,
                  icon: "🔥",
                  color: "from-red-500 to-orange-500",
                },
                {
                  label: "Total Purchases",
                  value: products.reduce((sum, p) => sum + (p.purchase_count || 0), 0),
                  icon: "🛒",
                  color: "from-green-500 to-emerald-600",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-3xl font-extrabold">{stat.value}</span>
                  </div>
                  <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Product Form Section */}
          <section id="products" className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 mb-4">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Add / Edit Product</h2>
              <ProductForm
                productForm={productForm}
                categories={categories}
                onChange={setProductForm}
                onImageUpload={handleImageUpload}
                onVideoUpload={handleVideoUpload}
                onDeleteImage={handleDeleteImage}
                onDeleteVideo={handleDeleteVideo}
                onSubmit={handleAddOrUpdateProduct}
                editingIndex={editingIndex}
              />
            </div>
          </section>

          {/* Products List Section */}
          <section className="mb-8">
            <ProductTable
              products={paginatedProducts}
              selectedProducts={selectedProducts}
              discounts={discounts}
              onSelectProduct={handleSelectProduct}
              onDiscountChange={handleDiscountChange}
              onApplyDiscount={applyDiscount}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              PRODUCTS_PER_PAGE={PRODUCTS_PER_PAGE}
            />
            
          </section>
        </main>
      </div>
    </div>
  );
}