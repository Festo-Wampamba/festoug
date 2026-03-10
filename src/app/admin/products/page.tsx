import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Plus, Pencil, Trash2, ChevronLeft } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const metadata = { title: "Admin | Products" };

export default async function AdminProductsPage() {
  const allProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <h2 className="text-white-2 text-xl font-bold">Products</h2>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-orange-yellow-crayola text-smoky-black px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-yellow-crayola/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      <div className="bg-eerie-black-1 border border-jet rounded-2xl shadow-1 overflow-hidden">
        {allProducts.length === 0 ? (
          <p className="text-light-gray-70 text-sm p-8 text-center">
            No products yet. Click "Add Product" to create your first one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-jet text-light-gray-70 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Variant ID</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-jet/50 hover:bg-jet/20 transition-colors group relative"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white-2 font-medium">
                          <Link href={`/admin/products/${product.id}/edit`} className="before:absolute before:inset-0">
                            {product.name}
                          </Link>
                        </p>
                        <p className="text-light-gray-70 text-xs">{product.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-jet/60 text-light-gray text-xs font-medium px-2.5 py-1 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white-2 font-semibold">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 text-light-gray-70 text-xs font-mono">
                      {product.variantId || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`w-2.5 h-2.5 rounded-full inline-block ${
                          product.isActive ? "bg-green-400" : "bg-red-400"
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 relative z-10">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 rounded-lg hover:bg-eerie-black-1 text-light-gray hover:text-orange-yellow-crayola transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
