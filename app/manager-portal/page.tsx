"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ReadBookingItems,
  ReadUserById,
} from "@/lib/actions";

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

interface User {
  email: string;
}

export default function Component() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});

  // Fetch the requests initially when the component is mounted
  async function fetchRequests() {
    const fetchedRequests = await ReadBookingItems();
    setRequests(fetchedRequests);
    await fetchUsers(fetchedRequests);
  }

  // Fetch users based on requests
  async function fetchUsers(requests: Request[]) {
    const userMap: { [key: string]: User } = {};
    const userFetchPromises = requests.map(async (request) => {
      const user = await ReadUserById(request.requestedBy);
      userMap[request.requestedBy] = user;
    });

    // Wait for all user fetch promises to resolve
    await Promise.all(userFetchPromises);
    setUsers(userMap);
  }

  // Use Effect hook to fetch requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Requests</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Start Date/Time</TableHead>
              <TableHead>End Date/Time</TableHead>
              <TableHead>Requested Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...requests]
              .filter((request) => request.status === "approved")
              .reverse()
              .map((request) => (
                <TableRow
                  key={request.$id}
                  className="border-b border-gray-200 hover:bg-muted"
                >
                  <TableCell>
                    {users[request.requestedBy]?.email || "Loading..."}
                  </TableCell>
                  <TableCell>{request.itemName}</TableCell>
                  <TableCell>{request.start}</TableCell>
                  <TableCell>{request.end}</TableCell>
                  <TableCell>{request.bookedQuantity}</TableCell>
                  <TableCell>
                    <Badge className="px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800">
                      {request.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
