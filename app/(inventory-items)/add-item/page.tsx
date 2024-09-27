/**
 * v0 by Vercel.
 * @see https://v0.dev/t/3PYYakh1PZK
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import  Input from "@/components/ui/input";
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
import { CreateInventoryItem, fetchUsersByRole } from "@/lib/actions";
import { unstable_noStore as noStore } from "next/cache";

export default async function Component() {
  noStore()
  // FETCH USERS BY ROLE
  const societies = await fetchUsersByRole("Society");
  const councils = await fetchUsersByRole("council");


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
        <form action={CreateInventoryItem} className="grid gap-6">
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
              <Input id="image" type="file" />
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
              <Label
                htmlFor="available-quantity"
                className="text-sm font-medium"
              >
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
                    {
                      societies.map((society) => (
                        <SelectItem key={society.$id} value={society.id}>{society.firstName} {society.lastName}</SelectItem>
                      ))
                    }
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
                    {
                      councils.map((council) => (
                        <SelectItem key={council.$id} value={council.id}>{council.firstName} {council.lastName}</SelectItem>
                      ))
                    }
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button>Save Item</Button>
        </form>
          

      </CardContent>
      {/* <CardFooter className="flex justify-end">
        
      </CardFooter> */}
    </Card>
  );
}
