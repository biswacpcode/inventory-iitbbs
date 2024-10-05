"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // Import router for redirection
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReadAllBookingItems, ReadUserById, checkRole } from "@/lib/actions"; // Import checkRole
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
  receivedAt: string;
  returnedAt: string;
}

interface User {
  email: string;
}

export default function Component() {

  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Check user role and decide whether to fetch data or redirect
  async function checkAuthorization() {
    const isAdmin = await checkRole("Admin");
    if (!isAdmin) {
      alert("You are unauthorized.");
       // Redirect if unauthorized
       window.location.href = "https://inventory-iitbbs.vercel.app/";
    } else {
      fetchRequests(); // Fetch data if authorized
    }
  }

  // Fetch all booking requests and related users
  async function fetchRequests() {
    setLoading(true); // Start loading
    const fetchedRequests = await ReadAllBookingItems(); // Fetch booking items
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

  // Fetch requests on component mount after checking authorization
  useEffect(() => {
    checkAuthorization(); // Check authorization on component mount
  }, []);

  // Filter requests based on the search term (email)
  const filteredRequests = requests
    .filter((request) =>
      request.itemName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .reverse();

  if (loading) {
    return <Loading />; // Show loading while fetching data
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Requests</h1>

      {/* ------------------------ SEARCH BOX -------------------- */}
      <div className="mb-6">
        <Input
          placeholder="Search by item name..."
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
              <TableHead>Received At</TableHead>
              <TableHead>Returned At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow
                key={request.$id}
                className="border-b border-gray-200 hover:bg-muted"
              >
                <TableCell>
                  {users[request.requestedBy]?.email || <Loading />}
                </TableCell>
                <TableCell>
                    {request.itemName}
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
                <TableCell>{request.receivedAt}</TableCell>
                <TableCell>{request.returnedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
