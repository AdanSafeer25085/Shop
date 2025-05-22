import React from "react";

export default function CategoryForm({ value, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="mb-6 bg-white p-6 rounded-lg shadow-lg border border-gray-100">
      <label className="block font-medium mb-2 text-gray-700">Add Category:</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Enter category name"
        className="border border-gray-200 p-2 rounded-lg w-full mb-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-black placeholder-black"
      />
      <button
        type="submit"
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md"
      >
        Add Category
      </button>
    </form>
  );
} 