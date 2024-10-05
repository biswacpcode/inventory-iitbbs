import { database } from "@/lib/appwrite.config"; // Adjust the import path based on your project structure
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
// import { unstable_noStore as noStore } from "next/cache";
import { Query } from "node-appwrite";

export async function GET() {
  // noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if (!user || !user.id) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Extract the email and domain
  const email = user.email?.toLowerCase() ?? "";
  const emailDomain = email.split("@")[1];

  // Check if the user's email domain is "iitbbs.ac.in"
  if (emailDomain !== "iitbbs.ac.in") {
    return NextResponse.json({ error: 'Unauthorized. Only iitbbs.ac.in emails are allowed.' }, { status: 403 });
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
    dbUser = response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    console.error("Error during database query:", error);
    throw new Error("Failed to retrieve user from Appwrite database");
  }

  // Determine the user's role based on their email
  let role = "Student"; // Default role

  if (email.includes("biswajit")) {
    role = "Society";
  } else if (email.includes("iitbbs")) {
    role = "Council";
  } else if (email.includes("22mm01002")) {
    role = "Manager";
  }
  if (email === "secyweb.sg@iitbbs.ac.in" || email ==="president.sg@iitbbs.ac.in")
    role="Admin";

  // If the user doesn't exist, create a new user with the determined role
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
          role: role, // Assign the determined role
        }
      );
    } catch (error) {
      throw new Error("Failed to create user in Appwrite database");
    }
  }

  // Redirect to the appropriate portal based on the user's role
  const baseUrl = "https://inventory-iitbbs.vercel.app/";
  let redirectUrl = baseUrl;

  if (role === "Manager") {
    redirectUrl = `${baseUrl}manager-portal`;
  } else if (role === "Society") {
    redirectUrl = `${baseUrl}items-requests`;
  } else {
    redirectUrl = `${baseUrl}inventory`;
  }

  return NextResponse.redirect(redirectUrl);
}
