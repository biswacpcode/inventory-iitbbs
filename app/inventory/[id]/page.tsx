"use client";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import  Input  from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { JSX, SVGProps, useState, useEffect, FormEvent } from "react";
import { ReadInventoryItemById, CreateBookingRequest, ReadUserById } from "@/lib/actions";
import Loading from "@/components/shared/Loader";

export default function Component({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<any>(null);
  const [zyada, setZyada] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDateMin, setEndDateMin] = useState("");
  const [purpose, setPurpose] = useState("");
  const [purLength, setPurLength] = useState(0);
  const [startTime, setStartTime] = useState(""); // To track start time
  const [endTime, setEndTime] = useState(""); // To track end time
  const [societyName, setSocietyName] = useState<string>("");
    const [councilName, setCouncilName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      const fetchedItem = await ReadInventoryItemById(params.id);
      setItem(fetchedItem);

      if (fetchedItem) {
        const society = await ReadUserById(fetchedItem.society);
        const council = await ReadUserById(fetchedItem.council);
        setSocietyName(society.lastName);
        setCouncilName(council.lastName);
    }
    }
    

    const today = new Date();
    const date = today.toISOString().split("T")[0];
    const time = today.toTimeString().split(":").slice(0, 2).join(":");
    setCurrentDate(date);
    setCurrentTime(time);

    fetchItem();
  }, [params.id]);

  const handleQuantityChange = (e: any) => {
    const value = parseInt(e.target.value, 10);
    setZyada(isNaN(value) || (value > item.availableQuantity && value > 0));
  };

  const handleStartDateChange = (e: any) => {
    const selectedStartDate = e.target.value;
    setStartDate(selectedStartDate);
    setEndDateMin(selectedStartDate);
    checkEmptyFields(
      selectedStartDate,
      startTime,
      endDateMin,
      endTime,
      purpose
    );
  };

  const handleStartTimeChange = (e: any) => {
    const selectedStartTime = e.target.value;
    setStartTime(selectedStartTime);
    checkEmptyFields(
      startDate,
      selectedStartTime,
      endDateMin,
      endTime,
      purpose
    );
  };

  const handleEndDateChange = (e: any) => {
    const selectedEndDate = e.target.value;
    setEndDateMin(selectedEndDate);
    checkEmptyFields(startDate, startTime, selectedEndDate, endTime, purpose);
  };

  const handleEndTimeChange = (e: any) => {
    const selectedEndTime = e.target.value;
    setEndTime(selectedEndTime);
    checkEmptyFields(
      startDate,
      startTime,
      endDateMin,
      selectedEndTime,
      purpose
    );
  };

  const handlePurposeChange = (e: any) => {
    const purposeValue = e.target.value;
    setPurpose(purposeValue);
    setPurLength(purposeValue.length);
    checkEmptyFields(startDate, startTime, endDateMin, endTime, purposeValue);
  };
  

  const checkEmptyFields = (
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
    purpose: string
  ) => {
    const isAnyFieldEmpty =
      !startDate || !startTime || !endDate || !endTime || !purpose.trim();
    setZyada(isAnyFieldEmpty);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form fields if necessary
    if (zyada || purLength === 0) {
      return;
    }

    setIsLoading(true);

    try {

      const bookedQuantity = parseInt(
        (e.currentTarget.elements.namedItem("bookedQuantity") as HTMLInputElement).value,
        10
      );
      // Prepare form data
      const formData = new FormData();
      formData.append("itemId", item.$id);
      formData.append("requestedTo", item.addedBy);
      formData.append("startDate", startDate);
      formData.append("startTime", startTime);
      formData.append("endDate", endDateMin);
      formData.append("endTime", endTime);
      formData.append("bookedQuantity", bookedQuantity.toString());
      formData.append("purpose", purpose);
      formData.append("status", item.defaultStatus);

      // Call the CreateBookingRequest function
      await CreateBookingRequest(formData);

      // Optionally, you can navigate the user or show a success message here
      // For example:
      // router.push("/success");
    } catch (error) {
      console.error("Error creating booking request:", error);
      // Handle error appropriately (e.g., show a notification)
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) return <Loading/>;
  console.log(item.itemImage);

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
            <span>Damaged: {(item.damagedQuantity) ? item.damagedQuantity : 0}</span>
            <Separator orientation="vertical" className="h-5" />
            <span>Total: {item.totalQuantity}</span>
            
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <UsersIcon className="w-5 h-5" />
            <span>Society: {societyName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BuildingIcon className="w-5 h-5" />
            <span>Council: {councilName}</span>
          </div>
        </div>
      </div>

      {/* ---------------------- BOOKING DETAILS ---------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Reserve Item</CardTitle>
          <CardDescription>
            Select the dates and quantity you need.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <input type="hidden" name="itemId" value={item.$id} />
                <input type="hidden" name="requestedTo" value={item.society} />
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  type="date"
                  id="start-date"
                  name="startDate"
                  min={currentDate}
                  onChange={handleStartDateChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  type="time"
                  id="start-time"
                  name="startTime"
                  min={currentDate === startDate ? currentTime : ""}
                  onChange={handleStartTimeChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  type="date"
                  id="end-date"
                  name="endDate"
                  min={endDateMin || currentDate}
                  onChange={handleEndDateChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  type="time"
                  id="end-time"
                  name="endTime"
                  min={endDateMin === startDate ? currentTime : ""}
                  onChange={handleEndTimeChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                type="number"
                id="quantity"
                min="1"
                name="bookedQuantity"
                onChange={handleQuantityChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose (Required)</Label>
              <Textarea
                id="purpose"
                rows={3}
                name="purpose"
                value={purpose}
                onChange={handlePurposeChange}
              />
            </div>
            {isLoading ?
            <Loading/> :
            <Button
              size="lg"
              className="w-full"
              style={{
                cursor: zyada ? "not-allowed" : "pointer",
                pointerEvents: zyada ? "none" : "auto",
              }}
              disabled={zyada || purLength===0}
            >
              Reserve Item
            </Button>
            }
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function BuildingIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
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
  );
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
      <path d="M21 8a2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
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
  );
}
