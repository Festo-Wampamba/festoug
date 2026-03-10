import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, LayoutTemplate, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.query.products.findFirst({
    where: eq(products.slug, slug)
  });
  if (!p) return { title: "Product Not Found" };
  return {
    title: `${p.name} | FestoUG Store`,
    description: p.description || `Purchase ${p.name} digital download.`,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const features = [
    "Lifetime Access & Updates",
    "Source Code Included",
    "Clean, Modern Architecture",
    "Easy to Customize",
    "Premium Support (30 days)",
  ];

  return (
    <article className="animate-in fade-in duration-500 xl:pr-[60px]">
      <Link
        href="/store"
        className="inline-flex items-center gap-2 text-light-gray-70 hover:text-orange-yellow-crayola transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="aspect-video bg-eerie-black-1 border border-jet rounded-[20px] overflow-hidden flex items-center justify-center relative shadow-1">
            {product.thumbnailUrl ? (
              <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-12">
                <LayoutTemplate className="w-20 h-20 text-orange-yellow-crayola/20 mx-auto mb-4" />
                <span className="text-light-gray-70 text-lg font-light">Preview Image Loading...</span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="bg-smoky-black/80 backdrop-blur-sm border border-jet text-xs font-semibold px-4 py-1.5 rounded-full text-light-gray uppercase tracking-wider">
                {product.category}
              </span>
            </div>
          </div>

          <section className="bg-eerie-black-1 border border-jet rounded-[20px] p-8 shadow-1">
            <h3 className="text-2xl font-bold text-white-2 mb-6 flex items-center gap-3">
              <span className="bg-orange-yellow-crayola/10 text-orange-yellow-crayola p-2 rounded-xl">
                <Zap className="w-5 h-5" />
              </span>
              Product Overview
            </h3>
            <div className="prose prose-invert prose-orange max-w-none text-light-gray font-light leading-relaxed">
              {product.description ? (
                product.description.split('\n').map((para, i) => (
                  <p key={i} className={para.trim() ? "mb-4" : ""}>{para}</p>
                ))
              ) : (
                <p>No description provided yet.</p>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-[100px] bg-eerie-black-1 border border-jet rounded-[20px] p-8 shadow-2">
            <h1 className="text-3xl font-bold text-white-2 mb-2 line-clamp-2">{product.name}</h1>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-bold text-orange-yellow-crayola">${product.price}</span>
              <span className="text-light-gray-70 text-sm">USD</span>
            </div>

            <div className="space-y-4 mb-8">
              <Link
                href={`/api/checkout?productId=${product.id}`}
                className="block w-full text-center bg-orange-yellow-crayola text-smoky-black py-4 rounded-xl font-bold text-lg hover:bg-orange-yellow-crayola/90 hover:shadow-[0_0_20px_rgba(255,181,63,0.3)] transition-all shadow-md"
              >
                Purchase Now
              </Link>
              <p className="text-center text-xs text-light-gray-70 flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-green-500/80" />
                Secure checkout handled by Lemon Squeezy
              </p>
            </div>

            <hr className="border-jet mb-6" />

            <h4 className="text-white-2 font-semibold mb-4 text-sm uppercase tracking-wider">What&apos;s Included</h4>
            <ul className="space-y-3">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-light-gray text-sm">
                  <CheckCircle2 className="w-5 h-5 text-orange-yellow-crayola shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
