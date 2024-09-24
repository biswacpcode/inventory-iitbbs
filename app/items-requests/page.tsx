'use client'
import { ReadBookingItemsByRequestedTo, ApproveBookingRequest } from '@/lib/actions'
import { useEffect, useState, SVGProps } from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function Page() {
  const [items, setItems] = useState<any[]>([])

  // Fetch requests using useEffect
  useEffect(() => {
    async function fetchItems() {
      try {
        const fetchedItems = await ReadBookingItemsByRequestedTo()
        setItems(fetchedItems)
      } catch (error) {
        console.error('Error fetching items:', error)
      }
    }

    fetchItems()
  }, []) // Empty dependency array means this runs once after the initial render

  // Function to approve an item
  async function approveItem(requestId: string, statusTo: string) {
    try {
      await ApproveBookingRequest(requestId, statusTo)
      // Optionally refetch items after approving
      const updatedItems = await ReadBookingItemsByRequestedTo()
      setItems(updatedItems)
    } catch (error) {
      console.error('Failed to change status:', error)
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
            {[...items].reverse().map((item) => (
              <TableRow key={item.$id} className="border-b border-gray-200 hover:bg-muted">
                <TableCell>{item.itemName}</TableCell>
                <TableCell>{item.start}</TableCell>
                <TableCell>{item.end}</TableCell>
                <TableCell>{item.bookedQuantity}</TableCell>
                <TableCell>
                  <Badge
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending'
                        ? 'bg-yellow-200 text-yellow-800'
                        : item.status === 'approved'
                        ? 'bg-green-200 text-green-800'
                        : item.status === 'rejected'
                        ? 'bg-red-200 text-red-800'
                        : item.status === 'issued'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => approveItem(item.$id, "approved")}>
                    <FilePenIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => approveItem(item.$id, "rejected")}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function FilePenIcon(props: SVGProps<SVGSVGElement>) {
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
  )
}