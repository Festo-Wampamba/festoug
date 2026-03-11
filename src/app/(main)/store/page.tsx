import { withRetry } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Digital Store | Plugins, Scripts & Templates",
  description: "Browse premium digital products carefully crafted to accelerate your next project.",
};

export default async function StorePage() {
  // Fetch active products with retry for Neon cold starts
  const availableProducts = await withRetry((db) =>
    db.query.products.findMany({
      where: eq(products.isActive, true),
      orderBy: [desc(products.createdAt)],
    })
  );

  return (
    <article className="animate-in fade-in duration-500 xl:pr-[60px]">
      <header className="mb-10 md:mb-16">
        <h2 className="text-white-2 text-3xl md:text-5xl font-semibold mb-6 pb-5 capitalize relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-[40px] before:h-[5px] before:bg-orange-yellow-crayola before:rounded-[3px]">
          Digital Store
        </h2>
        <p className="text-light-gray text-[15px] font-light leading-relaxed max-w-2xl">
          Premium scripts, Next.js templates, and productivity tools designed to help you ship faster. 
          Buy once, use forever.
        </p>
      </header>

      {availableProducts.length === 0 ? (
        <div className="bg-eerie-black-1 border border-jet rounded-[20px] p-12 text-center shadow-1">
          <ShoppingCart className="w-12 h-12 text-light-gray-70 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white-2 mb-2">Store is Empty</h3>
          <p className="text-light-gray font-light">
            I am currently migrating my digital products. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProducts.map((product) => (
            <Link 
              key={product.id} 
              href={`/store/${product.slug}`}
              className="bg-eerie-black-1 border border-jet rounded-[20px] overflow-hidden group hover:border-orange-yellow-crayola/30 transition-all shadow-1"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-eerie-black-2 relative overflow-hidden flex items-center justify-center">
                {product.thumbnailUrl ? (
                  <img 
                    src={product.thumbnailUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-jet to-eerie-black-1 flex items-center justify-center">
                    <span className="text-orange-yellow-crayola/50 text-4xl font-bold uppercase">
                      {product.name.substring(0, 2)}
                    </span>
                  </div>
                )}
                
                {/* Category Badge */}
                <span className="absolute top-3 left-3 bg-smoky-black/80 backdrop-blur-sm border border-jet text-xs font-semibold px-3 py-1 rounded-full text-light-gray tracking-wide">
                  {product.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-white-2 mb-2 line-clamp-1 group-hover:text-orange-yellow-crayola transition-colors">
                  {product.name}
                </h3>
                <p className="text-light-gray text-sm font-light line-clamp-2 mb-4">
                  {product.description || "No description available."}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-bold text-white-2">
                    ${product.price}
                  </span>
                  <span className="text-orange-yellow-crayola text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    View Details
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
