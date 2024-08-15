/**
 * v0 by Vercel.
 * @see https://v0.dev/t/VpUcoGpun0c
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import { JSX, SVGProps, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Component() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      serialNumber: "REQ-001",
      name: "Laptop Charger",
      startDate: "2023-06-01 09:00 AM",
      endDate: "2023-06-15 05:00 PM",
      requestedQuantity: 2,
      status: "pending",
    },
    {
      id: 2,
      serialNumber: "REQ-002",
      name: "Wireless Mouse",
      startDate: "2023-06-05 11:30 AM",
      endDate: "2023-06-12 03:45 PM",
      requestedQuantity: 1,
      status: "approved",
    },
    {
      id: 3,
      serialNumber: "REQ-003",
      name: "Printer Ink Cartridge",
      startDate: "2023-06-10 02:00 PM",
      endDate: "2023-06-20 06:30 PM",
      requestedQuantity: 3,
      status: "canceled",
    },
    {
      id: 4,
      serialNumber: "REQ-004",
      name: "Ergonomic Keyboard",
      startDate: "2023-06-15 08:00 AM",
      endDate: "2023-06-25 04:00 PM",
      requestedQuantity: 1,
      status: "issued",
    },
    {
      id: 5,
      serialNumber: "REQ-005",
      name: "HDMI Cable",
      startDate: "2023-06-20 10:30 AM",
      endDate: "2023-06-30 07:15 PM",
      requestedQuantity: 2,
      status: "returned",
    },
  ])
  const handleDelete = (id: number) => {
    setRequests(requests.filter((request) => request.id !== id))
  }
  const handleEdit = (id: number) => {}
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Requests</h1>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-3 text-left">Serial Number</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Start Date/Time</th>
              <th className="px-4 py-3 text-left">End Date/Time</th>
              <th className="px-4 py-3 text-left">Requested Quantity</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="px-4 py-3 font-medium">{request.serialNumber}</td>
                <td className="px-4 py-3">{request.name}</td>
                <td className="px-4 py-3">{request.startDate}</td>
                <td className="px-4 py-3">{request.endDate}</td>
                <td className="px-4 py-3">{request.requestedQuantity}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === "pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : request.status === "approved"
                        ? "bg-green-200 text-green-800"
                        : request.status === "canceled"
                        ? "bg-red-200 text-red-800"
                        : request.status === "issued"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(request.id)}>
                    <FilePenIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(request.id)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FilePenIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
    </svg>
  )
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
  )
}