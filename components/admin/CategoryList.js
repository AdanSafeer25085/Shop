import React from "react";

export default function CategoryList({ categories, onDelete }) {
  if (!categories.length) return <p className="text-gray-500 mb-4">No categories added yet.</p>;
  return (
    <ul className="list-disc pl-5 mb-4 border text-black">
      {categories.map((cat, index) => (
        <li key={index} className="flex items-center justify-between">
          {cat.name}
          <button
            onClick={() => onDelete(cat.name)}
            className="text-red-500 ml-4 border-l border-white px-5 py-1"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
} 