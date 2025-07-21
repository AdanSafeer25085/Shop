import React, { useState } from "react";
import { incrementPurchaseCount, decrementPurchaseCount } from '@/lib/supabaseClient';
import Image from 'next/image';

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
  console.log("ProductTable received products:", products);
  console.log("Number of products in table:", products?.length);

  // Pagination for mobile view only
  const [mobilePage, setMobilePage] = useState(1);
  const MOBILE_PRODUCTS_PER_PAGE = 10;
  const mobileTotalPages = Math.ceil((products?.length || 0) / MOBILE_PRODUCTS_PER_PAGE);
  const paginatedMobileProducts = products?.slice(
    (mobilePage - 1) * MOBILE_PRODUCTS_PER_PAGE,
    mobilePage * MOBILE_PRODUCTS_PER_PAGE
  ) || [];

  const NoProductsMessage = () => (
    <div className="p-8 text-center bg-white rounded-lg shadow-lg">
      <p className="text-gray-500 text-lg">No products found. Add some products to get started.</p>
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-4 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        <p className="text-xs text-gray-500 ml-1">Select products to apply discounts.</p>
        {selectedProducts.length > 0 && (
          <button
            onClick={onApplyDiscount}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Apply Discounts
          </button>
        )}
      </div>

      {/* Responsive Card Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(!products || products.length === 0) ? (
          <NoProductsMessage />
        ) : (
          paginatedMobileProducts.map((prod, index) => (
            <div key={prod.id} className="bg-white rounded-lg shadow-lg p-3 sm:p-4 space-y-3 sm:space-y-4 border border-gray-100 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(prod.id)}
                  onChange={() => onSelectProduct(prod.id)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate flex-1">{prod.name}</h3>
                {prod.discount > 0 && (
                  <span className="text-indigo-600 font-bold text-xs sm:text-sm">{prod.discount}% OFF</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-2">
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium text-gray-700 truncate">{prod.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-medium text-indigo-600">Rs{prod.price}</p>
                </div>
                <div>
                  <p className="text-gray-500">Purchases</p>
                  <p className="font-medium text-gray-700">{prod.purchase_count || 0}</p>
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
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-black placeholder-black text-xs sm:text-sm"
                  />
                </div>
              )}

              {prod.images?.length > 0 && (
                <div>
                  <p className="text-gray-500 mb-1">Images</p>
                  <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
                    {prod.images.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        alt={`${prod.name} image ${idx + 1}`}
                        width={64}
                        height={64}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg shadow-sm"
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

              <div className="flex flex-wrap gap-1 sm:gap-2 pt-2 mt-auto">
                <button
                  onClick={() => onEditProduct(index)}
                  className="flex-1 bg-indigo-100 text-indigo-700 py-2 rounded-lg hover:bg-indigo-200 transition-colors duration-200 text-xs sm:text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteProduct(index)}
                  className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors duration-200 text-xs sm:text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Confirm this purchase?')) {
                      try {
                        const productId = prod.id;
                        if (!productId) throw new Error('Product ID not found');
                        await incrementPurchaseCount(productId);
                        window.location.reload();
                      } catch (error) {
                        console.error('Error updating purchase count:', error);
                        alert('Failed to update purchase count. Please try again.');
                      }
                    }
                  }}
                  className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg hover:bg-green-200 transition-colors duration-200 text-xs sm:text-sm"
                >
                  +1
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Remove this purchase?')) {
                      try {
                        const productId = prod.id;
                        if (!productId) throw new Error('Product ID not found');
                        await decrementPurchaseCount(productId);
                        window.location.reload();
                      } catch (error) {
                        console.error('Error updating purchase count:', error);
                        alert('Failed to update purchase count. Please try again.');
                      }
                    }
                  }}
                  className="flex-1 bg-yellow-100 text-yellow-700 py-2 rounded-lg hover:bg-yellow-200 transition-colors duration-200 text-xs sm:text-sm"
                >
                  -1
                </button>
              </div>
            </div>
          ))
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