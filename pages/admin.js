"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

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

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/");
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/login");
    }

    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data.map((d) => d.name));
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 4 - productForm.images.length;

    if (files.length > remainingSlots) {
      alert(`You can only add up to 4 images in total.`);
      return;
    }

    const base64Promises = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    const base64Images = await Promise.all(base64Promises);
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, ...base64Images],
    }));
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProductForm((prev) => ({
        ...prev,
        video: reader.result,
      }));
    };
    reader.readAsDataURL(file);
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
        await fetchProducts();
        setEditingIndex(null);
        resetForm();
      }
    } else {
      const { error } = await supabase.from("products").insert([productForm]);
      if (!error) {
        await fetchProducts();
        resetForm();
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
      await fetchProducts();
    }
  };

  const handleEditProduct = (index) => {
    setProductForm(products[index]);
    setEditingIndex(index);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = categoryInput.trim();
    if (!name || categories.includes(name))
      return alert("Category exists or invalid.");
    const { error } = await supabase.from("categories").insert([{ name }]);
    if (!error) {
      await fetchCategories();
      setCategoryInput("");
    }
  };

  const handleDeleteCategory = async (name) => {
    const productsInCategory = products.filter((p) => p.category === name);
    const confirmed = confirm(
      `Delete category "${name}"?\nIt contains ${productsInCategory.length} product(s).`
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
      await fetchCategories();
      await fetchProducts();
    }
  };

  const handleDeleteImage = (idx) => {
    const updatedImages = productForm.images.filter((_, i) => i !== idx);
    setProductForm((prev) => ({ ...prev, images: updatedImages }));
  };

  const handleDeleteVideo = () => {
    setProductForm((prev) => ({ ...prev, video: null }));
  };
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discounts, setDiscounts] = useState({});

  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleDiscountChange = (id, value) => {
    setDiscounts((prev) => ({ ...prev, [id]: value }));
  };

  const applyDiscount = async () => {
    if (selectedProducts.length === 0) {
      alert("Select at least one product");
      return;
    }

    // Validate all discounts first
    for (let id of selectedProducts) {
      const discount = parseFloat(discounts[id]);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        alert(`Enter a valid discount between 0 and 100 for product ID ${id}`);
        return;
      }
    }

    try {
      // Reset discount for all products first
      const { error: resetError } = await supabase
        .from("products")
        .update({ discount: 0 })
        .gte("discount", 1);

      if (resetError) throw resetError;

      // Apply new discounts to selected products
      for (let id of selectedProducts) {
        const discount = parseFloat(discounts[id]);
        const { error } = await supabase
          .from("products")
          .update({ discount })
          .eq("id", id);

        if (error) throw error;
      }

      alert("Discounts applied successfully");
      await fetchProducts();
      setSelectedProducts([]);
      setDiscounts({});
    } catch (error) {
      console.error("Failed to apply discount:", error);
      alert("Failed to apply discount: " + error.message);
    }
  };

  return (
    <div className="p-4 max-w-[1300px] m-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Categories:</h2>
      {categories.length > 0 ? (
        <ul className="list-disc pl-5 mb-4 border">
          {categories.map((cat, index) => (
            <li key={index} className="flex items-center justify-between">
              {cat}
              <button
                onClick={() => handleDeleteCategory(cat)}
                className="text-red-500 ml-4 border-l border-white px-5 py-1"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mb-4">No categories added yet.</p>
      )}

      <form onSubmit={handleAddCategory} className="mb-6">
        <label className="font-semibold">Add Category:</label>
        <input
          type="text"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Category
        </button>
      </form>

      <form
        onSubmit={handleAddOrUpdateProduct}
        className="mb-6 border p-4 rounded"
      >
        <h2 className="text-xl font-semibold mb-2">
          {editingIndex !== null ? "Edit Product" : "Add Product"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            value={productForm.name}
            onChange={(e) =>
              setProductForm({ ...productForm, name: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Price"
            value={productForm.price}
            onChange={(e) =>
              setProductForm({ ...productForm, price: e.target.value })
            }
            className="border p-2 rounded"
          />
          <select
            value={productForm.category}
            onChange={(e) =>
              setProductForm({ ...productForm, category: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Description"
            value={productForm.description}
            onChange={(e) =>
              setProductForm({ ...productForm, description: e.target.value })
            }
            className="border p-2 rounded"
          />
          <div className="col-span-full">
            <label className="block font-medium mb-1">
              Upload Images (Max 4):
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="border p-2 rounded w-full"
              placeholder="Select up to 4 images"
            />
          </div>

          <div className="col-span-full mt-4">
            <label className="block font-medium mb-1">
              Upload Product Video (1 file):
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="border p-2 rounded w-full"
              placeholder="Select one video file"
            />
          </div>
        </div>

        {productForm.images.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {productForm.images.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={img}
                  alt=""
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  onClick={() => handleDeleteImage(idx)}
                  className="absolute top-0 right-0 text-white bg-red-600 rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {productForm.video && (
          <div className="mt-2 relative">
            <video src={productForm.video} controls className="w-64 h-auto" />
            <button
              onClick={handleDeleteVideo}
              className="absolute top-1 left-1 bg-red-600 text-white text-sm px-2 py-1 rounded"
            >
              Remove Video
            </button>
          </div>
        )}

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingIndex !== null ? "Update Product" : "Add Product"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Products List:</h2>
      {products.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Select</th>
                <th className="border p-2">Discount</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Category</th>
                <th className="border p-2">Price</th>
                <th className="border p-2">Images</th>
                <th className="border p-2">Video</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((prod, index) => (
                <tr key={index}>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(prod.id)}
                      onChange={() => handleSelectProduct(prod.id)}
                    />
                  </td>
                  <td className="border p-2 text-center">
                    {selectedProducts.includes(prod.id) && (
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          placeholder="Discount %"
                          value={discounts[prod.id] || ""}
                          onChange={(e) =>
                            handleDiscountChange(prod.id, e.target.value)
                          }
                          className="w-20 p-1 border rounded mb-1 text-center"
                        />
                        <button
                          onClick={() => applyDiscount(prod.id)}
                          className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="border p-2 text-center">{prod.name}</td>
                  <td className="border p-2 text-center">{prod.category}</td>
                  <td className="border p-2 text-center">{prod.price}</td>
                  <td className="border p-2">
                    {prod.images?.length > 0 ? (
                      <div className="flex gap-2 justify-center">
                        {prod.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className="w-8 h-8 object-cover rounded"
                          />
                        ))}
                      </div>
                    ) : (
                      "No Images"
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    {prod.video ? (
                      <video
                        src={prod.video}
                        className="w-16 h-12 mx-auto"
                        controls
                      />
                    ) : (
                      "No Video"
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleEditProduct(index)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(index)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No products added yet.</p>
      )}
    </div>
  );
}
