import { database } from "@/lib/appwrite.config"; // Adjust the import path based on your project structure
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
// import { unstable_noStore as noStore } from "next/cache";
import { Query } from "node-appwrite";

export async function GET() {
  // noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  console.log(user?.id);

  if (!user || !user.id) {
    throw new Error("User not found");
  }

  // Get the collection ID from environment variables
  
  const collectionId = process.env.USERS_COLLECTION_ID!;
  const databaseId = process.env.DATABASE_ID!;

  // Try to find the user in the Appwrite database
  let dbUser;
  try {
    console.log("Attempting to retrieve user from database with ID:", user.id);
    const response = await database.listDocuments(
      databaseId,
      collectionId,
      [Query.equal("id", user.id)]
    );
    console.log("Database query response:", response);
    dbUser = response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    console.error("Error during database query:", error);
    throw new Error("Failed to retrieve user from Appwrite database");
  } 

  // If the user doesn't exist, create a new user
  if (!dbUser) {
    try {
      dbUser = await database.createDocument(
        databaseId,
        collectionId,
        user.id,
        {
          id: user.id,
          email: user.email ?? "",
          firstName: user.given_name ?? "",
          lastName: user.family_name ?? "",
          imageUrl: user.picture ?? "",
          role: "Student",
        }
      );
    } catch (error) {
      throw new Error("Failed to create user in Appwrite database");
    }
  }

  // Redirect to the development environment URL
  const redirectUrl = "http://localhost:3000";
  return NextResponse.redirect(redirectUrl);
}
