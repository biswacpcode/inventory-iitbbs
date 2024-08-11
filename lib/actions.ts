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

// Define the fetchSocietyUsers function
export async function fetchSocietyUsers() {
  try {
    const response = await database.listDocuments(
      '[YOUR_DATABASE_ID]', // Replace with your database ID
      '[YOUR_COLLECTION_ID]', // Replace with your collection ID for users
      [
        Query.equal("role", ["society"])
      ]
    );

    return response.documents;
  } catch (error) {
    console.error('Error fetching society users:', error);
    throw new Error('Failed to fetch society users');
  }
}