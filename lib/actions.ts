"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { database, users , storage} from "@/lib/appwrite.config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Query } from "node-appwrite";
import { Socket } from "dgram";

// ADDING NEW INVENTORY ITEM
export async function CreateInventoryItem(formdata: FormData) {
  // VERIFYING USER
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/");
    return;
  }

  // EXTRACTING FORM DATA
  const itemName = formdata.get("name") as string;
  const itemImage = formdata.get("itemImage") as File; // Corrected key
  const totalQuantity = parseInt(formdata.get("total-quantity") as string, 10);
  const availableQuantity = parseInt(formdata.get("available-quantity") as string, 10);
  const description = formdata.get("description") as string;
  const society = formdata.get("society") as string;
  const council = formdata.get("council") as string;
  const defaultStatus = formdata.get("defaultStatus") as string;
  const maxQuantity = parseInt(formdata.get("allowed-quantity") as string, 10);
  const maxTime = parseInt(formdata.get("allowed-time") as string, 10);

  let imageUrl = '';

  // Handle file upload to Appwrite Storage
  if (itemImage && itemImage.size > 0) {
    try {
      const response = await storage.createFile(
        process.env.BUCKET_ID!,    // Your Appwrite bucket ID
        'unique()',                // Unique file ID
        itemImage                  // The file to be uploaded
      );

      // After uploading, construct the URL to access the file
      imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.BUCKET_ID}/files/${response.$id}/view?project=${process.env.PROJECT_ID}`;
      
      console.log("Image uploaded successfully:", imageUrl);
      
    } catch (error) {
      console.error("Error uploading file to Appwrite storage:", error);
      throw new Error("Failed to upload image to Appwrite storage");
    }
  } else {
    imageUrl = 'https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg';
    console.warn("No image file provided or file is empty.");
  }

  // Create a new document in Appwrite database
  try {
    await database.createDocument(
      process.env.DATABASE_ID!,              // Your Appwrite database ID
      process.env.ITEMS_COLLECTION_ID!,      // Your collection ID
      'unique()',                            // Unique document ID
      {
        itemName,
        description,
        totalQuantity,
        availableQuantity,
        society,
        council,
        defaultStatus,
        itemImage: imageUrl,// Store the image URL in the database
        maxQuantity,
        maxTime,                 
        addedBy: user.id                  // Use the correct user ID property
      }
    );

    console.log("Inventory item created successfully.");
    revalidatePath('/add-item');
  } catch (error) {
    console.error("Failed to create inventory item:", error);
    throw new Error("Failed to create inventory item");
  }

  redirect("/inventory");
}
//check coorect Society

export async function checkSocietyCorrect(requestId: string){
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return false; // Or handle the unauthorized case as needed
  }

  try{
    const userId = user.id;
    const us = await ReadUserById(userId);
    const society_extracted = us.$id;
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!, 
      [Query.equal("$id", [requestId])]
    );
    if (society_extracted === response.documents[0].requestedTo)
      return true;
    else
    return false;
  }catch (error) {
    console.error("Failed to check role:", error);
    throw new Error("Failed to check role");
  }

}

//Check if authorized role or not
export async function checkRole(role: string){
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return false; // Or handle the unauthorized case as needed
  }

  try{
    const userId = user.id;
    const us = await ReadUserById(userId);
    const role_assigned = us.role;
    if (role_assigned === role)
      return true;
    else
    return false;
  }catch (error) {
    console.error("Failed to check role:", error);
    throw new Error("Failed to check role");
  }

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
      issuedQuantity: doc.totalQuantity-doc.availableQuantity-doc.damagedQuantity,
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
      damagedQuantity: response.damagedQuantity,
      defaultStatus: response.defaultStatus,
    };

    return item;
  } catch (error) {
    console.error("Failed to read inventory item:", error);
    throw new Error("Failed to read inventory item");
  }
}
// Read Booking request per ID

export async function ReadBookedItembyId(requestId: string) {
  try {
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!, 
      [Query.equal("$id", [requestId])]
    );

    if (response.documents.length === 0) {
      throw new Error("No items found");
    }

    const doc = response.documents[0];
    const inventoryItem = await ReadInventoryItemById(doc.itemId);
    const bookedQuanitity: number = doc.bookedQuantity;
    const status: string = doc.status;

    return {
      $id: inventoryItem.$id,
      itemName: inventoryItem.itemName,
      itemImage: inventoryItem.itemImage,
      totalQuantity: inventoryItem.totalQuantity,
      availableQuantity: inventoryItem.availableQuantity,
      description: inventoryItem.description,
      society: inventoryItem.society,
      council: inventoryItem.council,
      addedBy: inventoryItem.addedBy,
      bookedQuantity: bookedQuanitity,
      status: status,
    };
  } catch (error) {
    console.error("Failed to read booking items:", error);
    throw new Error("Failed to read booking items");
  }
}
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

//Read all the Requests irrespective of user for admin
export async function ReadAllBookingItems() {
  try {
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!
    );

    const itemsWithNames = await Promise.all(
      response.documents.map(async (doc) => {  
        const inventoryItem = await ReadInventoryItemById(doc.itemId);
        const start = formatDateTime(doc.start);
        const end = formatDateTime(doc.end);

        return {
          $id: doc.$id,
          itemId: doc.itemId,
          itemName: inventoryItem.itemName,
          start: start,
          end: end,
          purpose: doc.purpose,
          bookedQuantity: doc.bookedQuantity,
          requestedBy: doc.requestedUser,
          status: doc.status,
          receivedAt: (doc.receivedAt)?formatDateTime(doc.receivedAt):"not collected yet",
          returnedAt: (doc.receivedAt)? (doc.returnedAt) ? formatDateTime(doc.returnedAt): "not returned yet":"not collected yet"
        };
      })
    );

    return itemsWithNames;
  } catch (error) {
    console.error("Failed to read all booking items:", error);
    throw new Error("Failed to read all booking items");
  }
}



// Read all the Requests irrespective of user for manager

export async function ReadBookingItems() {
  try {
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!
    );

    const itemsWithNames = await Promise.all(
      response.documents.filter(doc => (doc.status === "approved" || doc.status ==="issued" || doc.status === "collected")).map(async (doc) => {  // Corrected the filter syntax
        const inventoryItem = await ReadInventoryItemById(doc.itemId);
        const start = formatDateTime(doc.start);
        const end = formatDateTime(doc.end);

        return {
          $id: doc.$id,
          itemId: doc.itemId,
          itemName: inventoryItem.itemName,
          start: start,
          end: end,
          purpose: doc.purpose,
          bookedQuantity: doc.bookedQuantity,
          requestedBy: doc.requestedUser,
          status: doc.status,
        };
      })
    );

    return itemsWithNames;
  } catch (error) {
    console.error("Failed to read booking items:", error);
    throw new Error("Failed to read booking items");
  }
}


// GET USER BY ID
export async function ReadUserById(userId: string) {
  // if (userId===null)
  //   return;
  try {
    // Fetch a single inventory item by ID
    const response = await database.getDocument(
      process.env.DATABASE_ID!,
      process.env.USERS_COLLECTION_ID!,
      userId
    );

    // Map the document to the InventoryItem type
    const user = {
      $id: response.id,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role,
      email: response.email,
    };

    return user;
  } catch (error) {
    // console.error("Failed to read user:", error);
    throw new Error("Failed to read user");
  }
}
// FETCH USERS BY ROLE
export async function fetchUsersByRole(role: string) {
  try {
    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.USERS_COLLECTION_ID!,
      [Query.equal("role", [role])]
    );

    return response.documents;
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw new Error("Failed to fetch users by role");
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
  const item = await ReadInventoryItemById(itemId);
  const startDate = formdata.get("startDate") as string;
  const startTime = formdata.get("startTime") as string;
  const endDate = formdata.get("endDate") as string;
  const endTime = formdata.get("endTime") as string;
  const bookedQuantity = parseInt(formdata.get("bookedQuantity") as string, 10);
  const purpose = formdata.get("purpose") as string;
  const requestedTo = formdata.get("requestedTo") as string;
  const status = formdata.get("status") as string;

  // COMBINE DATE AND TIME INTO ISO STRING
  const start = new Date(`${startDate}T${startTime}`).toISOString();
  const end = new Date(`${endDate}T${endTime}`).toISOString();

  try {
    // Create a new booking request in Appwrite
    await database.createDocument(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!, // Ensure these are set in your .env.local
      "unique()", // Generates a unique document ID
      {
        itemId,
        start,
        end,
        purpose,
        bookedQuantity,
        requestedUser: user.id, // Associate booking with the current user
        requestedTo,
        status , // Set the initial status
      }
    );
    const newAvailableQuantity = item.availableQuantity - bookedQuantity;

    // Update the item to reduce available quantity
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!, // Ensure this is set to your items collection ID
      itemId, // Use itemId to identify the document
      {
        availableQuantity: newAvailableQuantity,
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
      [Query.equal("requestedUser", [user.id])]
    );

    // Initialize an array to store the items with itemName
    const itemsWithNames = [];

    // Iterate over the fetched booking items
    for (const doc of response.documents) {
      // Fetch the corresponding inventory item to get the itemName
      const inventoryItem = await ReadInventoryItemById(doc.itemId);
      const start = formatDateTime(doc.start);
      const end = formatDateTime(doc.end);

      // Construct the booking item with the itemName included
      const bookingItem = {
        $id: doc.$id,
        itemId: doc.itemId,
        itemName: inventoryItem.itemName, // Adding itemName here
        start: start,
        end: end,
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
// Reading items that are by each society

export async function ReadItemsInSociety() {
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
      process.env.ITEMS_COLLECTION_ID!,
      [Query.equal("society", [user.id])]
    );

    // Initialize an array to store the items with itemName
    const itemsWithDetails = [];

    // Iterate over the fetched documents to construct the items array
    for (const doc of response.documents) {
      // Construct the inventory item with the required fields
      const inventoryItem = {
        $id: doc.$id,
        itemName: doc.itemName, // Adding itemName here
        totalQuantity: doc.totalQuantity, // Assuming these fields exist in the document
        availableQuantity: doc.availableQuantity,
        issuedQuantity: doc.totalQuantity-doc.availableQuantity - doc.damagedQuantity, // Assuming these fields exist in the document
      };

      // Add the inventory item to the array
      itemsWithDetails.push(inventoryItem);
    }

    return itemsWithDetails; // Return the array of inventory items

  } catch (error) {
    console.error("Error fetching items:", error);
    throw new Error("Failed to fetch items"); // Handle the error appropriately
  }
}
//Delting the item

export async function UpdateInventoryItem(itemId: string, total: number, available: number){
  try{
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!, // Ensure this is set to your items collection ID
      itemId, // Use itemId to identify the document
      {
        availableQuantity: available,
        totalQuantity: total
      }
    );
  }
  catch (error) {
    console.error("Failed to update inventory:", error);
    throw new Error("Failed to update inventory");
  }
}

//Recieved Item from Manager - Time Update
export async function receivetimeUpdate(requestId: string, currentTime: string){
  try{
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!,
      requestId,
      {
        receivedAt: currentTime
      }
    );
  }
  catch (error) {
    console.error("Failed to update received time:", error);
    throw new Error("Failed to update received time:");
}
}


//Returned to the Manager - Time Update
export async function returntimeUpdate(requestId: string, itemId: string, currentTime: string, bookedQuanitity: number){
  try{
    
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!,
      requestId,
      {
        returnedAt: currentTime
      }
    );

    const response = await database.getDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!,
      itemId
    );
    const availableQuantity = response.availableQuantity;
    const newAvailableQuantity = availableQuantity+bookedQuanitity;
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!,
      itemId,
      {
        availableQuantity: newAvailableQuantity
        }
        );
  }
  catch (error) {
    console.error("Failed to update returned time:", error);
    throw new Error("Failed to update returned time:");
}
}

export async function DeleteInventoryItem(
  itemId: string,
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  try {
    // Deleting the document from the Appwrite database
    await database.deleteDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!,
      itemId
    );

    const response = await database.listDocuments(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!,
      [Query.equal("itemId", [itemId])]
    );

    for (const doc of response.documents){
      await database.deleteDocument(
        process.env.DATABASE_ID!,
        process.env.BOOKINGS_COLLECTION_ID!,
        doc.$id
        );
    }

    revalidatePath(`/inventory-check`);
  } catch (error) {
    console.error("Failed to delete booking request:", error);
    throw new Error("Failed to delete booking request");
  }
}

//Updataing damaged quantitiy
export async function DamagedQuantityUpdate(
  itemId: string,
  bookedQuantity: number
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  try{
    const damagedQuantity = bookedQuantity;
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!, // Ensure this is set to your items collection ID
      itemId, // Use itemId to identify the document
      {
        damagedQuantity: damagedQuantity
      }
    );
  }
  catch (error) {
    console.error("Failed to update the damaged quantity:", error);
    throw new Error("Failed to damaged quantity");
  }
}
  


// Deleting Requests that are requested by "requestedUser ID"

export async function DeleteBookingRequest(
  requestId: string,
  itemId: string,
  bookedQuantity: number
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  try {
    // Deleting the document from the Appwrite database
    await database.deleteDocument(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!,
      requestId
    );
    const item = await ReadInventoryItemById(itemId);
    const newAvailableQuantity = item.availableQuantity + bookedQuantity;

    // Update the item to reduce available quantity
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.ITEMS_COLLECTION_ID!, // Ensure this is set to your items collection ID
      itemId, // Use itemId to identify the document
      {
        availableQuantity: newAvailableQuantity,
      }
    );

    revalidatePath(`/requests`);
  } catch (error) {
    console.error("Failed to delete booking request:", error);
    throw new Error("Failed to delete booking request");
  }
}

// Change the status to approved from booking id which will be provides

export async function ApproveBookingRequest(
  requestId: string,
  statusTo: string
) {
  try {
    // Update the status of the booking request to "approved"
    await database.updateDocument(
      process.env.DATABASE_ID!,
      process.env.BOOKINGS_COLLECTION_ID!,
      requestId,
      {
        status: statusTo,
      }
    );

    revalidatePath(`/items-requests`);
  } catch (error) {
    console.error("Failed to approve booking request:", error);
    throw new Error("Failed to approve booking request");
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
      [Query.equal("requestedTo", [user.id])]
    );

    // Initialize an array to store the items with itemName
    const itemsWithNames = [];

    // Iterate over the fetched booking items
    for (const doc of response.documents) {
      // Fetch the corresponding inventory item to get the itemName
      const inventoryItem = await ReadInventoryItemById(doc.itemId);
      const start = formatDateTime(doc.start);
      const end = formatDateTime(doc.end);

      // Construct the booking item with the itemName included
      const bookingItem = {
        $id: doc.$id,
        itemId: doc.itemId,
        itemName: inventoryItem.itemName, // Adding itemName here
        start: start,
        end: end,
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
