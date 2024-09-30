"use client";

import { useState, useEffect, SVGProps } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ReadItemsInSociety, DeleteInventoryItem, UpdateInventoryItem } from "@/lib/actions"; 
import Link from "next/link";
import Loading from "@/components/shared/Loader";
import { Check, X } from "lucide-react";

// Define the type for inventory item
interface InventoryItem {
    $id: string;
    itemName: string;
    totalQuantity: number;
    availableQuantity: number;
    issuedQuantity: number;
  }
  
  // Define a type for the edited item
  interface EditedItem {
    totalQuantity?: number;
    availableQuantity?: number;
  }
  
  export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<string | null>(null); // Loading state for deletion
    const [editedItems, setEditedItems] = useState<{ [key: string]: EditedItem }>({});
  
    // Fetch the inventory items when the component is mounted
    async function fetchItems() {
      const fetchedItems = await ReadItemsInSociety();
      setItems(fetchedItems);
    }
  
    // Use Effect hook to fetch inventory items on mount
    useEffect(() => {
      fetchItems();
    }, []);
  
    // Handle deletion of an item
    async function handleDelete(itemId: string) {
      setLoading(itemId); // Set loading for the specific item
      try {
        await DeleteInventoryItem(itemId);
        fetchItems(); // Refetch items after successful deletion
      } catch (error) {
        console.error("Failed to delete the item:", error);
      } finally {
        setLoading(null); // Reset loading state
      }
    }
  
    // Handle quantity change
    const handleQuantityChange = (itemId: string, field: keyof EditedItem, change: number) => {
      setEditedItems((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: (prev[itemId]?.[field] ?? items.find(item => item.$id === itemId)![field]) + change,
        },
      }));
    };
  
    // Handle saving changes
    // Handle saving changes
async function handleChange(itemId: string) {
  setLoading(itemId); // Set loading for the specific item
  const item = items.find((i) => i.$id === itemId);

  if (!item) {
    console.error("Item not found");
    return;
  }

  const totalQuantity = editedItems[itemId]?.totalQuantity ?? item.totalQuantity;
  const availableQuantity = editedItems[itemId]?.availableQuantity ?? item.availableQuantity;

  try {
    await UpdateInventoryItem(itemId, totalQuantity, availableQuantity);
    fetchItems(); // Refetch items after successful update

    // After saving, reset the edited item to show the delete button
    setEditedItems((prev) => {
      const newItems = { ...prev };
      delete newItems[itemId]; // Remove the edited state for this item
      return newItems;
    });
  } catch (error) {
    console.error("Failed to update the item:", error);
  } finally {
    setLoading(null); // Reset loading state
  }
}

  
    // Handle canceling changes
    const handleCancelChanges = (itemId: string) => {
      setEditedItems((prev) => {
        const newItems = { ...prev };
        delete newItems[itemId]; // Remove the key instead of setting it to undefined
        return newItems;
      });
    };
    
  
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Inventory Items</h1>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Total Quantity</TableHead>
                <TableHead>Available Quantity</TableHead>
                <TableHead>Total Issued</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...items].reverse().map((item) => (
                <TableRow
                  key={item.$id}
                  className="border-b border-gray-200 hover:bg-muted"
                >
                  <TableCell>
                    <Link href={`/inventory/${item.$id}`}>
                      {item.itemName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Button onClick={() => handleQuantityChange(item.$id, 'totalQuantity', -1)}>-</Button>
                      <span className="mx-2">{editedItems[item.$id]?.totalQuantity ?? item.totalQuantity}</span>
                      <Button onClick={() => handleQuantityChange(item.$id, 'totalQuantity', 1)}>+</Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Button onClick={() => handleQuantityChange(item.$id, 'availableQuantity', -1)}>-</Button>
                      <span className="mx-2">{editedItems[item.$id]?.availableQuantity ?? item.availableQuantity}</span>
                      <Button onClick={() => handleQuantityChange(item.$id, 'availableQuantity', 1)}>+</Button>
                    </div>
                  </TableCell>
                  <TableCell>{item.issuedQuantity}</TableCell>
                  <TableCell className="flex items-center gap-2 w-40 left-5">
                    {loading === item.$id ? (
                      <Loading /> // Placeholder for your loading component
                    ) : (
                      <>
                        {editedItems[item.$id] ? (
                          <>
                            <Button
                              variant="outline"
                              title="Save"
                              size="sm"
                              onClick={()=> handleChange(item.$id)}
                            >
                              <Check/>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleCancelChanges(item.$id)}
                              title="Cancel"
                              size="sm"
                            >
                              <X/>
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(item.$id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  // SVG Trash Icon Component
  function TrashIcon(props: SVGProps<SVGSVGElement>) {
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
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    );
  }