"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { checkRole, CreateInventoryItem, fetchUsersByRole } from "@/lib/actions";
import { useRouter } from "next/router";

export default function Component() {
  let societies, councils;

  // Check authorization and fetch users after the component mounts
  useEffect(() => {
    const checkAuthorizationAndFetchUsers = async () => {
      const isAdmin = await checkRole("Admin");
      if (!isAdmin) {
        alert("You are unauthorized.");
        window.location.href = "https://inventory-iitbbs.vercel.app/";
      } else {
        societies = await fetchUsersByRole("Society");
        councils = await fetchUsersByRole("Council");
      }
    };
    checkAuthorizationAndFetchUsers();
  }, []);

  return (
    <Card className="max-w-2xl mx-auto p-6 sm:p-8 md:p-10">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">
          Add New Inventory Item
        </CardTitle>
        <CardDescription>
          Fill out the details below to add a new item to your inventory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={CreateInventoryItem} className="grid gap-6" encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input id="name" name="name" placeholder="Enter item name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image" className="text-sm font-medium">
                Image
              </Label>
              <Input id="image" type="file" name="itemImage" accept="image/*" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Enter item description"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="total-quantity" className="text-sm font-medium">
                Total Quantity
              </Label>
              <Input
                id="total-quantity"
                name="total-quantity"
                type="number"
                placeholder="Enter total quantity"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="available-quantity" className="text-sm font-medium">
                Available Quantity
              </Label>
              <Input
                id="available-quantity"
                name="available-quantity"
                type="number"
                placeholder="Enter available quantity"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="society" className="text-sm font-medium">
                Society
              </Label>
              <Select name="society">
                <SelectTrigger>
                  <SelectValue placeholder="Select society" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Societies</SelectLabel>
                    {societies.map((society) => (
                      <SelectItem key={society.$id} value={society.id}>
                        {society.firstName} {society.lastName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="council" className="text-sm font-medium">
                Council
              </Label>
              <Select name="council">
                <SelectTrigger>
                  <SelectValue placeholder="Select council" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Councils</SelectLabel>
                    {councils.map((council) => (
                      <SelectItem key={council.$id} value={council.id}>
                        {council.firstName} {council.lastName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Default Request Status
            </Label>
            <Select name="defaultStatus">
              <SelectTrigger>
                <SelectValue placeholder="Select default status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Statuses</SelectLabel>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button>Save Item</Button>
        </form>
      </CardContent>
    </Card>
  );
}
