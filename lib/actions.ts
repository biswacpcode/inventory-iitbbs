"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { database } from "@/lib/appwrite.config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Query } from "node-appwrite";


// ADDING NEW INVENTORY ITEM
export async function CreateInventoryItem(formdata: FormData) {
  // VERIFYING USER
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  // EXTRACTING FORM DATA
  const itemName = formdata.get("name") as string;
  const itemImage = "https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg"; // Placeholder, handle the actual image upload
  const totalQuantity = parseInt(formdata.get("total-quantity") as string, 10);
  const availableQuantity = parseInt(formdata.get("available-quantity") as string, 10);
  const description = formdata.get("description") as string;
  const society = formdata.get("society") as string;
  const council = formdata.get("council") as string;

  // You might want to handle the file upload separately before this step if there is an image to be uploaded
//   console.log({ itemName, itemImage, totalQuantity, availableQuantity, description, society, council });


  try {
    // Create a new inventory item in Appwrite
    await database.createDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!, // Ensure these are set in your .env.local
      'unique()', // Generates a unique document ID
      {
        itemName,
        description,
        totalQuantity,
        availableQuantity,
        society,
        council,
        itemImage,
        addedBy: user.id, // Associate item with the current user
      }
    );

    revalidatePath(`/add-item`);
  } catch (error) {
    console.error("Failed to create inventory item:", error);
    throw new Error("Failed to create inventory item");
  }
  redirect("/inventory");
}

// READING INVENTORY ITEMS
export async function ReadInventoryItems() {
  // VERIFYING USER
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return null; // Or handle the unauthorized case as needed
  }

  try {
    // Fetch inventory items from Appwrite
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!
    );

    // Map the documents to the InventoryItem type
    const items = response.documents.map((doc) => ({
      $id: doc.$id,
      itemName: doc.itemName,
      itemImage: doc.itemImage,
      totalQuantity: doc.totalQuantity,
      availableQuantity: doc.availableQuantity,
      description: doc.description,
      society: doc.society,
      council: doc.council,
      addedBy: doc.addedBy,
    }));

    return items;
  } catch (error) {
    console.error("Failed to read inventory items:", error);
    throw new Error("Failed to read inventory items");
  }
}

// GET INVENTORY ITEM BY ID
export async function ReadInventoryItemById(itemId: string) {
  try {
    // Fetch a single inventory item by ID
    const response = await database.getDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!,
      itemId
    );

    // Map the document to the InventoryItem type
    const item = {
      $id: response.$id,
      itemName: response.itemName,
      itemImage: response.itemImage,
      totalQuantity: response.totalQuantity,
      availableQuantity: response.availableQuantity,
      description: response.description,
      society: response.society,
      council: response.council,
      addedBy: response.addedBy,
    };

    return item;
  } catch (error) {
    console.error("Failed to read inventory item:", error);
    throw new Error("Failed to read inventory item");
  }
}

// FETCH USERS BY ROLE
export async function fetchUsersByRole(role: string) {
  try {
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.USERS_COLLECTION_ID!,
      [
        Query.equal("role", [role])
      ]
    );

    return response.documents;
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw new Error('Failed to fetch users by role');
  }
}

// CREATING BOOKING REQUESTS
export async function CreateBookingRequest(formdata: FormData) {
  // VERIFYING USER
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  // EXTRACTING FORM DATA
  const itemId = formdata.get("itemId") as string;
  const startDate = formdata.get("startDate") as string;
  const startTime = formdata.get("startTime") as string;
  const endDate = formdata.get("endDate") as string;
  const endTime = formdata.get("endTime") as string;
  const bookedQuantity = parseInt(formdata.get("bookedQuantity") as string, 10);
  const purpose = formdata.get("purpose") as string;
  const requestedTo = formdata.get("requestedTo") as string;

  // COMBINE DATE AND TIME INTO ISO STRING
  const start = new Date(`${startDate}T${startTime}`).toISOString();
  const end = new Date(`${endDate}T${endTime}`).toISOString();

  try {
    // Create a new booking request in Appwrite
    await database.createDocument(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!, // Ensure these are set in your .env.local
      'unique()', // Generates a unique document ID
      {
        itemId, 
        start,
        end,
        purpose,
        bookedQuantity,
        requestedUser: user.id, // Associate booking with the current user
        requestedTo,
        status: "pending", // Set the initial status
      }
    );

    revalidatePath(`/inventory/${itemId}`);
  } catch (error) {
    console.error("Failed to create booking request:", error);
    throw new Error("Failed to create booking request");
  }
  redirect(`/requests`);
}

// GETTING BOOKING ITEMS BY "requestedUser" ID
export async function ReadBookingItemsByRequestedBy() {

  // VERIFYING USER
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  try {
      // Fetch booking items from Appwrite
      const response = await database.listDocuments(
          process.env.DATABASE_ID!,
          process.env.BOOKINGS_COLLECTION_ID!,
          [
              Query.equal("requestedUser", [user.id])
          ]
      );

      // Initialize an array to store the items with itemName
      const itemsWithNames = [];

      // Iterate over the fetched booking items
      for (const doc of response.documents) {
          // Fetch the corresponding inventory item to get the itemName
          const inventoryItem = await ReadInventoryItemById(doc.itemId);

          // Construct the booking item with the itemName included
          const bookingItem = {
              $id: doc.$id,
              itemId: doc.itemId,
              itemName: inventoryItem.itemName, // Adding itemName here
              start: doc.start,
              end: doc.end,
              purpose: doc.purpose,
              bookedQuantity: doc.bookedQuantity,
              requestedBy: doc.requestedBy,
              status: doc.status,
          };

          // Add the booking item to the array
          itemsWithNames.push(bookingItem);
      }

      return itemsWithNames;
  } catch (error) {
      console.error("Failed to read booking items:", error);
      throw new Error("Failed to read booking items");
  }
}

// GETTING BOOKING ITEMS BY "requestedTo" ID
export async function ReadBookingItemsByRequestedTo() {

  // VERIFYING USER
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  try {
      // Fetch booking items from Appwrite
      const response = await database.listDocuments(
          process.env.DATABASE_ID!,
          process.env.BOOKINGS_COLLECTION_ID!,
          [
              Query.equal("requestedTo", [user.id])
          ]
      );

      // Initialize an array to store the items with itemName
      const itemsWithNames = [];

      // Iterate over the fetched booking items
      for (const doc of response.documents) {
          // Fetch the corresponding inventory item to get the itemName
          const inventoryItem = await ReadInventoryItemById(doc.itemId);

          // Construct the booking item with the itemName included
          const bookingItem = {
              $id: doc.$id,
              itemId: doc.itemId,
              itemName: inventoryItem.itemName, // Adding itemName here
              start: doc.start,
              end: doc.end,
              purpose: doc.purpose,
              bookedQuantity: doc.bookedQuantity,
              requestedBy: doc.requestedBy,
              status: doc.status,
          };

          // Add the booking item to the array
          itemsWithNames.push(bookingItem);
      }

      return itemsWithNames;
  } catch (error) {
      console.error("Failed to read booking items:", error);
      throw new Error("Failed to read booking items");
  }
}


