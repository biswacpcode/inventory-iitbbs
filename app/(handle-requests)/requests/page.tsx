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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ReadBookingItemsByRequestedBy,
  DeleteBookingRequest,
} from "@/lib/actions";
import Link from "next/link";

interface Request {
  $id: string;
  itemId: any;
  itemName: any;
  start: any;
  end: any;
  purpose: any;
  bookedQuantity: any;
  requestedBy: any;
  status: any;
}

export default function Component() {
  const [requests, setRequests] = useState<Request[]>([]);

  // Fetch the requests initially when the component is mounted
  async function fetchRequests() {
    const fetchedRequests = await ReadBookingItemsByRequestedBy();
    setRequests(fetchedRequests);
  }

  // Use Effect hook to fetch requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle deletion of a request
  async function handleDelete(
    requestId: string,
    itemId: string,
    bookedQuantity: number
  ) {
    try {
      await DeleteBookingRequest(requestId, itemId, bookedQuantity);
      // Refetch requests after successful deletion
      fetchRequests();
    } catch (error) {
      console.error("Failed to delete the request:", error);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Requests</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Date/Time</TableHead>
              <TableHead>End Date/Time</TableHead>
              <TableHead>Requested Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...requests].reverse().map((request) => (
              <TableRow
                key={request.$id}
                className="border-b border-gray-200 hover:bg-muted"
              >
                <TableCell>
                  <Link href={`/requests/${request.$id}`}>
                    {request.itemName}
                  </Link>
                </TableCell>
                <TableCell>{request.start}</TableCell>
                <TableCell>{request.end}</TableCell>
                <TableCell>{request.bookedQuantity}</TableCell>
                <TableCell>
                  <Badge
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === "pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : request.status === "approved"
                        ? "bg-green-200 text-green-800"
                        : request.status === "rejected"
                        ? "bg-red-200 text-red-800"
                        : request.status === "issued"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleDelete(
                        request.$id,
                        request.itemId,
                        request.bookedQuantity
                      )
                    }
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TrashIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
