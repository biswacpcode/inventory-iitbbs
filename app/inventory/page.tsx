"use client";

import { JSX, SVGProps, useEffect, useState } from "react";
import { ReadInventoryItems } from "@/lib/actions"; // Make sure the import path is correct
import { Button } from "@/components/ui/button";

interface InventoryItem {
  $id: string;
  itemName: string;
  itemImage: string;
  totalQuantity: number;
  availableQuantity: number;
  description: string;
  society: string;
  council: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const inventoryItems = await ReadInventoryItems();
        setItems(inventoryItems || []);
      } catch (error) {
        console.error("Failed to fetch inventory items:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (items.length === 0) {
    return <p>No items found</p>;
  }
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* ------------------------ SEARCH BOX -------------------- */}
      {/* <div className="mb-6">
        <div className="relative">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background shadow-none appearance-none pl-8"
          />
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div> */}

      {/* ------------------------ CARD GRID -------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <div
            key={product.$id}
            className="bg-background rounded-lg overflow-hidden shadow-lg transition-all hover:shadow-xl border-2 border-white"
          >
            <img
              src="https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg"
              alt={product.itemImage}
              width={400}
              height={300}
              className="w-full h-60 object-cover"
              style={{ aspectRatio: "400/300", objectFit: "cover" }}
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.itemName}</h3>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <span className="text-muted-foreground">Total:</span>{" "}
                  <span className="font-medium">{product.totalQuantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Available:</span>{" "}
                  <span className="font-medium">
                    {product.availableQuantity}
                  </span>
                </div>
              </div>
              <Button size="sm" className="mt-4 w-full">
                Book
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
