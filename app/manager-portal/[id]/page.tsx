"use client"
import { useState, useEffect } from "react";
import { ApproveBookingRequest, DeleteBookingRequest, ReadBookedItembyId, ReadUserById } from "@/lib/actions";
import Loading from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Define the type for the item
interface InventoryItem {
    $id: string;
    itemImage: string;
    itemName: string;
    availableQuantity: number;
    totalQuantity: number;
    society: string;
    council: string;
}

interface Requested {
    bookedQuantity: number;
    status: string;
}

interface User {
    firstName: string;
    lastName: string;
}

export default function Component({ params }: { params: { id: string } }) {
    const [item, setItem] = useState<InventoryItem | null>(null);
    const [request, setRequest] = useState<Requested | null>(null);
    const [societyName, setSocietyName] = useState<string>("");
    const [councilName, setCouncilName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false); // To manage loading state
    const router = useRouter(); // For navigation

    // Fetch the inventory item details
    useEffect(() => {
        async function fetchItem() {
            try {
                const fetchedItem: InventoryItem = await ReadBookedItembyId(params.id);
                setItem(fetchedItem);
                const fetchRequst: Requested = await ReadBookedItembyId(params.id);
                setRequest(fetchRequst);

                // Fetch society and council details after fetching the item
                if (fetchedItem) {
                    const society = await ReadUserById(fetchedItem.society);
                    const council = await ReadUserById(fetchedItem.council);
                    setSocietyName(society.lastName);
                    setCouncilName(council.lastName);
                }
            } catch (error) {
                console.error("Error fetching item or user data", error);
            }
        }
        fetchItem();
    }, [params.id]);

    async function handleDelete(requestId: string, itemId: string, bookedQuantity: number) {
        setLoading(true);
        try {
            await DeleteBookingRequest(requestId, itemId, bookedQuantity);
            router.push('/manager-portal'); // Redirect after success
        } catch (error) {
            console.error("Failed to delete the request:", error);
        } finally {
            setLoading(false);
        }
    }

    async function approveItem(requestId: string, statusTo: string) {
        setLoading(true);
        try {
            await ApproveBookingRequest(requestId, statusTo);
            router.push('/manager-portal'); // Redirect after success
        } catch (error) {
            console.error('Failed to change status:', error);
        } finally {
            setLoading(false);
        }
    }

    const Buttons = () => {
        if (!request || !item) return null; // Handle null or undefined request and item safely

        if (request.status === 'issued') {
            return (
                <>
                    {loading ? <Loading /> : (
                        <Button
                            size="sm"
                            className="mt-4 w-full"
                            onClick={() => approveItem(params.id, "collected")}
                            title="Issue"
                        >
                            Issued
                        </Button>
                    )}
                </>
            );
        } else if (request.status === 'collected') {
            return (
                <>
                    {loading ? <Loading /> : (
                        <Button
                            size="sm"
                            className="mt-4 w-full"
                            onClick={() => handleDelete(params.id, item.$id, request.bookedQuantity)}
                            title="Return"
                        >
                            Returned
                        </Button>
                    )}
                </>
            );
        } else {
            return (
                <>
                    <Button
                        size="sm"
                        className="mt-4 w-full"
                        onClick={() => window.location.reload()}
                        title="Wait"
                    >
                        Wait till I turn to Issued
                    </Button>
                </>
            );
        }
    };

    // Display a loading state if the item is not yet fetched
    if (!item) {  
        return <Loading />;
    }

    return (
        <div className="grid md:grid-cols-2 gap-8 p-4 md:p-8 lg:p-12">
            {/* ---------------------- ITEM DETAILS ---------------------- */}
            <div className="grid gap-4">
                <img
                    src={item.itemImage}
                    alt={item.itemName}
                    width={600}
                    height={400}
                    className="rounded-lg object-cover w-full aspect-[3/2]"
                />
                <div className="grid gap-2">
                    <h2 className="text-2xl font-bold">{item.itemName}</h2>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span>Society: {societyName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span>Council: {councilName}</span>
                    </div>
                    <Buttons />
                </div>
            </div>
        </div>
    );
}
