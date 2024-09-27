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
import { ReadBookingItems, ReadUserById } from "@/lib/actions";
import Link from "next/link";
import Input from "@/components/ui/input"; // Ensure this is the correct import path for your Input component
import Loading from "@/components/shared/Loader";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  // Fetch all booking requests and related users when the component mounts
  async function fetchRequests() {
    setLoading(true); // Start loading
    const fetchedRequests = await ReadBookingItems(); // Fetch booking items
    setRequests(fetchedRequests);
    await fetchUsers(fetchedRequests); // Fetch users after fetching requests
    setLoading(false); // Stop loading after fetch is complete
  }

  // Fetch users based on the booking requests in parallel
  async function fetchUsers(requests: Request[]) {
    const userIds = [...new Set(requests.map((request) => request.requestedBy))]; // Get unique user IDs

    // Fetch users in parallel using Promise.all
    const userFetchPromises = userIds.map((userId) => ReadUserById(userId));
    const usersArray = await Promise.all(userFetchPromises);

    // Create a user map to store the fetched users
    const userMap: { [key: string]: User } = {};
    usersArray.forEach((user) => {
      if (user) userMap[user.$id] = user; // Use user ID as the key
    });

    setUsers(userMap); // Set the user data in the state
  }

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests based on the search term (email)
  const filteredRequests = requests
    .filter((request) =>
      users[request.requestedBy]?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((request) => request.status === "approved" || request.status === "issued" || request.status === "collected")
    .reverse();

  if (loading) {
    return <Loading/>; // Show loading while fetching data
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Requests</h1>

      {/* ------------------------ SEARCH BOX -------------------- */}
      <div className="mb-6">
        <Input
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-background shadow-none appearance-none pl-8"
        />
      </div>

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
            {filteredRequests.map((request) => (
              <TableRow
                key={request.$id}
                className="border-b border-gray-200 hover:bg-muted"
              >
                <TableCell>
                  {users[request.requestedBy]?.email || <Loading/>}
                </TableCell>
                <TableCell>
                  <Link href={`/manager-portal/${request.$id}`}>
                    {request.itemName}
                  </Link>
                </TableCell>
                <TableCell>{request.start}</TableCell>
                <TableCell>{request.end}</TableCell>
                <TableCell>{request.bookedQuantity}</TableCell>
                <TableCell>
                  <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'approved'
                        ? 'bg-green-200 text-green-800'
                        : request.status === 'issued'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
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
