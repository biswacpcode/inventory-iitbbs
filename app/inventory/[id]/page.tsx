import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { JSX, SVGProps } from "react"
import { ReadInventoryItemById } from "@/lib/actions"
import { CreateBookingRequest } from "@/lib/actions"

export default async function Component({ params }: { params: { id: string } }) {

  // Fetching the inventory item by ID
  const item = await ReadInventoryItemById(params.id)

  return (
    <div className="grid md:grid-cols-2 gap-8 p-4 md:p-8 lg:p-12">
      {/* ---------------------- ITEM DETAILS ---------------------- */}
      <div className="grid gap-4">
        <img
          src={item.itemImage}
          alt="Issue Item"
          width={600}
          height={400}
          className="rounded-lg object-cover w-full aspect-[3/2]"
        />
        <div className="grid gap-2">
          <h2 className="text-2xl font-bold">{item.itemName}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <PackageIcon className="w-5 h-5" />
            <span>Available: {item.availableQuantity}</span>
            <Separator orientation="vertical" className="h-5" />
            <span>Total: {item.totalQuantity}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <UsersIcon className="w-5 h-5" />
            <span>Society: {item.society}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BuildingIcon className="w-5 h-5" />
            <span>Council: {item.society}</span>
          </div>
        </div>
      </div>

      
      {/* ---------------------- BOOKING DETAILS ---------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Book Issue Item</CardTitle>
          <CardDescription>Select the dates and quantity you need.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" action={CreateBookingRequest}>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <input type="hidden" name="itemId" value={item.$id} />
                <input type="hidden" name="requestedTo" value={item.addedBy} />
                <Label htmlFor="start-date">Start Date</Label>
                <Input type="date" id="start-date" name="startDate" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input type="time" id="start-time" name="startTime" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input type="date" id="end-date" name="endDate" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input type="time" id="end-time" name="endTime" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input type="number" id="quantity" min="1" name="bookedQuantity" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea id="purpose" rows={3} name="purpose" />
            </div>
            <Button size="lg" className="w-full">
              Book Item
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function BuildingIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  )
}


function PackageIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}


function UsersIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}