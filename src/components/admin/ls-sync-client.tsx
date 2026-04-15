"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Download, AlertTriangle, RefreshCw, Package } from "lucide-react";

interface LsVariant {
  id: string;
  name: string;
  price: string;
  status: string;
  productId: string;
  alreadyImported: boolean;
  dbProduct: { id: string; name: string; slug: string } | null;
}

interface LsProduct {
  id: string;
  name: string;
  status: string;
}

const CATEGORIES = ["SCRIPT", "TEMPLATE", "PLUGIN", "SERVICE", "OTHER"];

export function LsSyncClient() {
  const [lsProducts, setLsProducts] = useState<LsProduct[]>([]);
  const [lsVariants, setLsVariants] = useState<LsVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ls-products");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setLsProducts(data.lsProducts);
      setLsVariants(data.lsVariants);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function importVariant(variant: LsVariant) {
    setImporting(variant.id);
    try {
      const res = await fetch("/api/admin/ls-products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant.id,
          name: variant.name,
          price: variant.price,
          category: categories[variant.id] || "OTHER",
        }),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 409) throw new Error(data.error || "Import failed");
      await load();
    } catch (e) {
      alert(`Import failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setImporting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-light-gray-70 py-12">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Loading Lemon Squeezy products…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-5">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-red-400 font-semibold text-sm">Failed to load LS products</p>
          <p className="text-red-300/70 text-xs mt-1">{error}</p>
          <button onClick={load} className="mt-3 text-xs text-orange-yellow-crayola hover:underline">Try again</button>
        </div>
      </div>
    );
  }

  if (lsVariants.length === 0) {
    return (
      <div className="bg-eerie-black-1 border border-jet rounded-2xl p-10 text-center">
        <Package className="w-10 h-10 text-light-gray-70 mx-auto mb-3" />
        <p className="text-white-2 font-semibold mb-1">No variants found</p>
        <p className="text-light-gray-70 text-sm">Make sure products are published in your Lemon Squeezy store.</p>
      </div>
    );
  }

  const importedCount = lsVariants.filter((v) => v.alreadyImported).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-light-gray-70 text-sm">
          {lsVariants.length} variant{lsVariants.length !== 1 ? "s" : ""} found ·{" "}
          <span className="text-green-400 font-medium">{importedCount} imported</span> ·{" "}
          <span className="text-orange-yellow-crayola font-medium">{lsVariants.length - importedCount} pending</span>
        </p>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-light-gray hover:text-white-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Grouped by LS product */}
      {lsProducts.map((lsProd) => {
        const variants = lsVariants.filter((v) => v.productId === lsProd.id);
        if (variants.length === 0) return null;

        return (
          <div key={lsProd.id} className="bg-eerie-black-1 border border-jet rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-jet flex items-center justify-between">
              <div>
                <p className="text-white-2 font-semibold text-sm">{lsProd.name}</p>
                <p className="text-light-gray-70 text-xs">LS Product ID: {lsProd.id}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                lsProd.status === "published"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-jet text-light-gray-70"
              }`}>
                {lsProd.status}
              </span>
            </div>

            <div className="divide-y divide-jet/50">
              {variants.map((variant) => (
                <div key={variant.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white-2 text-sm font-medium truncate">{variant.name}</p>
                    <p className="text-light-gray-70 text-xs mt-0.5">
                      Variant ID: <span className="font-mono">{variant.id}</span> · ${variant.price}
                    </p>
                    {variant.alreadyImported && variant.dbProduct && (
                      <p className="text-green-400 text-xs mt-1">
                        Linked to: <span className="font-mono">{variant.dbProduct.slug}</span>
                      </p>
                    )}
                  </div>

                  {variant.alreadyImported ? (
                    <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold shrink-0">
                      <CheckCircle className="w-4 h-4" /> Imported
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        aria-label={`Category for ${variant.name}`}
                        value={categories[variant.id] || "OTHER"}
                        onChange={(e) => setCategories((prev) => ({ ...prev, [variant.id]: e.target.value }))}
                        className="text-xs bg-jet border border-jet rounded-lg px-2 py-1.5 text-light-gray focus:outline-none focus:border-orange-yellow-crayola"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => importVariant(variant)}
                        disabled={importing === variant.id}
                        className="flex items-center gap-1.5 bg-orange-yellow-crayola text-smoky-black text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-orange-yellow-crayola/90 transition-colors disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {importing === variant.id ? "Importing…" : "Import"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="bg-eerie-black-1 border border-jet rounded-xl p-4">
        <p className="text-light-gray-70 text-xs leading-relaxed">
          <strong className="text-white-2">After importing:</strong> Future purchases made through the site store will sync automatically via webhook.
          To edit product details (name, description, thumbnail, download URL), go to{" "}
          <a href="/admin/products" className="text-orange-yellow-crayola hover:underline">Admin → Products</a>.
        </p>
      </div>
    </div>
  );
}
