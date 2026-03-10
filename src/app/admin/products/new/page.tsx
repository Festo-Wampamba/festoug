import { ProductForm } from "@/components/admin/product-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Admin | New Product" };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Products
        </Link>
        <h2 className="text-white-2 text-xl font-bold">Create New Product</h2>
      </div>
      <ProductForm />
    </div>
  );
}
