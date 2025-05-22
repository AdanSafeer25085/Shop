import React from "react";

export default function CategoryList({ categories, onDelete }) {
  if (!categories.length) return <p className="text-gray-500 mb-4">No categories added yet.</p>;
  return (
    <ul className="mb-4 border text-black flex flex-col gap-2">
      {categories.map((cat, index) => (
        <li key={index} className="flex items-center justify-between px-2 py-1 hover:bg-gray-50 rounded transition">
          <span>{cat.name}</span>
          <button
            onClick={() => onDelete(cat.name)}
            aria-label={`Delete category ${cat.name}`}
            className="ml-4 p-1 rounded-full hover:bg-red-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
} 