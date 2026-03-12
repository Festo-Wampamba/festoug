import { withRetry } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Admin | Edit Product" };

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await withRetry((db) => db.query.products.findFirst({
    where: eq(products.id, id),
  }));

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Products
        </Link>
        <h2 className="text-white-2 text-xl font-bold">Edit: {product.name}</h2>
      </div>
      <ProductForm
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          price: product.price,
          category: product.category,
          variantId: product.variantId || "",
          downloadUrl: product.downloadUrl || "",
          thumbnailUrl: product.thumbnailUrl || "",
          isActive: product.isActive,
        }}
      />
    </div>
  );
}
