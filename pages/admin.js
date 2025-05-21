"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

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

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/");
  };

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data);
    }
  }, []);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/login");
    }

    fetchCategories();
    fetchProducts();
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
        await fetchProducts();
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
    } else {
      alert("Failed to delete product");
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
      alert("Category exists or invalid.");
      return;
    }
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
      alert("Select at least one product");
      return;
    }

    for (let id of selectedProducts) {
      const discount = parseFloat(discounts[id]);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        alert(`Enter a valid discount between 0 and 100 for product ID ${id}`);
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
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Categories */}
      <h2 className="text-xl font-semibold mb-2">Categories:</h2>
      {categories.length > 0 ? (
        <ul className="list-disc pl-5 mb-4 border">
          {categories.map((cat, index) => (
            <li key={index} className="flex items-center justify-between">
              {cat.name}
              <button
                onClick={() => handleDeleteCategory(cat.name)}
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

      {/* Add Category Form */}
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

      {/* Product Form */}
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
              <option key={idx} value={cat.name}>
                {cat.name}
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
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-4 col-span-full">
            {productForm.images.map((img, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded overflow-hidden border"
              >
                <img
                  src={img}
                  alt={`uploaded-${idx}`}
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </div>
            ))}
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
            />
          </div>
          {productForm.video && (
            <div className="relative mt-2 col-span-full w-64 h-auto">
              <video src={productForm.video} controls className="w-full h-auto" />
              <button
                type="button"
                onClick={handleDeleteVideo}
                className="absolute top-1 left-1 bg-red-600 text-white text-sm px-2 py-1 rounded"
              >
                Remove Video
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingIndex !== null ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* Products List */}
      <h2 className="text-xl font-semibold mb-2">Products List:</h2>
      {products.length > 0 ? (
        <div className="overflow-x-auto">
          {/* Apply Discounts button */}
          {selectedProducts.length > 0 && (
            <button
              onClick={applyDiscount}
              className="mb-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Apply Discounts
            </button>
          )}
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
                <tr key={prod.id}>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(prod.id)}
                      onChange={() => handleSelectProduct(prod.id)}
                    />
                  </td>
                  <td className="border p-2 text-center">
                    {selectedProducts.includes(prod.id) && (
                      <input
                        type="number"
                        placeholder="Discount %"
                        value={discounts[prod.id] || ""}
                        onChange={(e) => handleDiscountChange(prod.id, e.target.value)}
                        className="w-20 p-1 border rounded text-center"
                      />
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
                            alt={`prod-img-${idx}`}
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
                    {prod.discount && prod.discount > 0 ? (
                      <span className="text-green-600 font-bold">{prod.discount}% OFF</span>
                    ) : (
                      "-"
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