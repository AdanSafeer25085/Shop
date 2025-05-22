import React, { useState } from "react";

export default function ProductTable({
  products,
  selectedProducts,
  discounts,
  onSelectProduct,
  onDiscountChange,
  onApplyDiscount,
  onEditProduct,
  onDeleteProduct,
  productSearch,
  setProductSearch,
  currentPage,
  setCurrentPage,
  totalPages,
  PRODUCTS_PER_PAGE,
}) {
  // Pagination for mobile view only
  const [mobilePage, setMobilePage] = useState(1);
  const MOBILE_PRODUCTS_PER_PAGE = 10;
  const mobileTotalPages = Math.ceil(products.length / MOBILE_PRODUCTS_PER_PAGE);
  const paginatedMobileProducts = products.slice(
    (mobilePage - 1) * MOBILE_PRODUCTS_PER_PAGE,
    mobilePage * MOBILE_PRODUCTS_PER_PAGE
  );

  return (
    <div className="w-full">
      <div className="mb-4 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-lg  flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Products List</h2>
          <input
            type="text"
            placeholder="Search products..."
            value={productSearch}
            onChange={e => {
              setProductSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto p-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-black placeholder-black text-sm transition-all duration-200"
          />
        </div>
        
        {selectedProducts.length > 0 && (
          <button
            onClick={onApplyDiscount}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Apply Discounts
          </button>
        )}
      </div>

      {/* Table/Cards Section */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discounted Price</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((prod, index) => (
              <tr key={prod.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(prod.id)}
                    onChange={() => onSelectProduct(prod.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="p-4">
                  {selectedProducts.includes(prod.id) ? (
                    <input
                      type="number"
                      placeholder="Discount %"
                      value={discounts[prod.id] || ""}
                      onChange={e => onDiscountChange(prod.id, e.target.value)}
                      className="w-20 p-1 border border-gray-200 rounded-lg text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-black placeholder-black"
                    />
                  ) : (
                    prod.discount > 0 ? (
                      <span className="text-indigo-600 font-bold">{prod.discount}% OFF</span>
                    ) : (
                      <span className="text-gray-400">No Discount</span>
                    )
                  )}
                </td>
                <td className="p-4">
                  {prod.discount > 0 ? (
                    <span className="text-green-600 font-semibold">${(prod.price - (prod.price * prod.discount / 100)).toFixed(2)}</span>
                  ) : (
                    <span className="text-gray-700">-</span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-900">{prod.name}</td>
                <td className="p-4 text-sm text-gray-600">{prod.category}</td>
                <td className="p-4 text-sm font-medium text-indigo-600">${prod.price}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {prod.images?.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${prod.name}-${idx}`}
                        className="w-10 h-10 object-cover rounded-lg shadow-sm"
                      />
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  {prod.video && (
                    <video src={prod.video} className="w-16 h-12 rounded-lg shadow-sm" controls />
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditProduct(index)}
                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteProduct(index)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View with Pagination */}
      <div className="md:hidden space-y-4">
        {paginatedMobileProducts.map((prod, index) => (
          <div key={prod.id} className="bg-white rounded-lg shadow-lg p-4 space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(prod.id)}
                  onChange={() => onSelectProduct(prod.id)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <h3 className="font-medium text-gray-900">{prod.name}</h3>
              </div>
              {prod.discount > 0 && (
                <span className="text-indigo-600 font-bold text-sm">
                  {prod.discount}% OFF
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-medium text-gray-700">{prod.category}</p>
              </div>
              <div>
                <p className="text-gray-500">Price</p>
                <p className="font-medium text-indigo-600">${prod.price}</p>
              </div>
            </div>

            {selectedProducts.includes(prod.id) && (
              <div>
                <p className="text-gray-500 mb-1">Discount</p>
                <input
                  type="number"
                  placeholder="Discount %"
                  value={discounts[prod.id] || ""}
                  onChange={e => onDiscountChange(prod.id, e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-black placeholder-black"
                />
              </div>
            )}

            {prod.images?.length > 0 && (
              <div>
                <p className="text-gray-500 mb-1">Images</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {prod.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${prod.name}-${idx}`}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {prod.video && (
              <div>
                <p className="text-gray-500 mb-1">Video</p>
                <video src={prod.video} className="w-full rounded-lg shadow-sm" controls />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onEditProduct(index)}
                className="flex-1 bg-indigo-100 text-indigo-700 py-2 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteProduct(index)}
                className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {/* Pagination for mobile */}
        {mobileTotalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setMobilePage((p) => Math.max(1, p - 1))}
              disabled={mobilePage === 1}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {mobilePage} of {mobileTotalPages}
            </span>
            <button
              onClick={() => setMobilePage((p) => Math.min(mobileTotalPages, p + 1))}
              disabled={mobilePage === mobileTotalPages}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 