import React from "react";

export default function ProductForm({
  productForm,
  categories,
  onChange,
  onImageUpload,
  onVideoUpload,
  onDeleteImage,
  onDeleteVideo,
  onSubmit,
  editingIndex
}) {
  return (
    <form onSubmit={onSubmit} className="mb-6 bg-white p-6 rounded-lg shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {editingIndex !== null ? "Edit Product" : "Add Product"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Product Name"
          value={productForm.name}
          onChange={e => onChange({ ...productForm, name: e.target.value })}
          className="border border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-black placeholder-black"
        />
        <input
          type="text"
          placeholder="Price"
          value={productForm.price}
          onChange={e => onChange({ ...productForm, price: e.target.value })}
          className="border border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-black placeholder-black"
        />
        <select
          value={productForm.category}
          onChange={e => onChange({ ...productForm, category: e.target.value })}
          className="border border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-black"
        >
          <option value="">Select Category</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Description"
          value={productForm.description}
          onChange={e => onChange({ ...productForm, description: e.target.value })}
          className="border border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-black placeholder-black"
        />
        <div className="col-span-full">
          <label className="block font-medium mb-2 text-gray-700">Upload Images (Max 4):</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onImageUpload}
            className="border border-gray-200 p-2 rounded-lg w-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-black"
          />
        </div>
        <div className="flex flex-wrap gap-3 mt-4 col-span-full">
          {productForm.images.map((img, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={img}
                alt={`uploaded-${idx}`}
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={() => onDeleteImage(idx)}
                className="absolute top-1 right-1 bg-red-100 text-red-700 rounded-full w-5 h-5 flex items-center justify-center text-sm hover:bg-red-200 transition-colors duration-200"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="col-span-full mt-4">
          <label className="block font-medium mb-2 text-gray-700">Upload Product Video (1 file):</label>
          <input
            type="file"
            accept="video/*"
            onChange={onVideoUpload}
            className="border border-gray-200 p-2 rounded-lg w-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-black"
          />
        </div>
        {productForm.video && (
          <div className="relative mt-2 col-span-full w-64 h-auto">
            <video src={productForm.video} controls className="w-full h-auto rounded-lg shadow-sm" />
            <button
              type="button"
              onClick={onDeleteVideo}
              className="absolute top-1 left-1 bg-red-100 text-red-700 text-sm px-2 py-1 rounded-lg hover:bg-red-200 transition-colors duration-200"
            >
              Remove Video
            </button>
          </div>
        )}
      </div>
      <button
        type="submit"
        className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md"
      >
        {editingIndex !== null ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
} 