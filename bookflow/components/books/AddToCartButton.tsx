"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { BookWithAuthor } from "@/lib/types";

type Props = {
  book: BookWithAuthor;
};

const FORMAT_LABELS: Record<string, string> = {
  paperback: "Paperback",
  hardcover: "Hardcover",
  pdf: "PDF (Digital)",
  epub: "EPUB (Digital)",
  audiobook: "Audiobook",
};

export default function AddToCartButton({ book }: Props) {
  const { addItem } = useCart();
  const [selectedFormat, setSelectedFormat] = useState<string>("paperback");
  const [added, setAdded] = useState(false);

  const availableFormats = Object.entries(book.formats)
    .filter(([, available]) => available)
    .map(([fmt]) => fmt);

  const getPrice = (fmt: string): number => {
    if (fmt === "paperback") return book.price_paperback ?? 0;
    if (fmt === "hardcover") return book.price_hardcover ?? 0;
    if (fmt === "audiobook") return book.price_audiobook ?? 0;
    return book.price_digital ?? 0;
  };

  const price = book.is_on_sale && book.sale_price
    ? book.sale_price
    : getPrice(selectedFormat);

  const handleAdd = () => {
    addItem({
      id: book.id,
      title: book.title,
      author: book.authors?.name ?? "",
      price,
      format: selectedFormat,
      slug: book.slug,
      cover_image_url: book.cover_image_url,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Format selector */}
      {availableFormats.length > 1 && (
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-2">Format</p>
          <div className="flex flex-wrap gap-2">
            {availableFormats.map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setSelectedFormat(fmt)}
                className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${
                  selectedFormat === fmt
                    ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                {FORMAT_LABELS[fmt] ?? fmt}
                <span className="ml-2 font-semibold">GHS {getPrice(fmt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price display */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-neutral-900">GHS {price}</span>
        {book.is_on_sale && book.sale_price && (
          <span className="text-lg text-neutral-400 line-through">
            GHS {getPrice(selectedFormat)}
          </span>
        )}
        {book.is_on_sale && (
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">SALE</span>
        )}
      </div>

      {/* Add to cart */}
      <button
        type="button"
        onClick={handleAdd}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base transition-all ${
          added
            ? "bg-green-500 text-white"
            : "bg-brand-500 hover:bg-brand-600 text-white"
        }`}
      >
        {added ? (
          <><Check className="w-5 h-5" /> Added to Cart</>
        ) : (
          <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
        )}
      </button>
    </div>
  );
}
