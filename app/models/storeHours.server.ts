import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function getStoreHours(shop: string) {
  console.log("Fetching store hours for shop:", shop);

  const results = await prisma.storeHours.findMany({
    where: { shop },
    orderBy: [{ weekday: "asc" }],
  });

  console.log("getStoreHours:", shop);
  console.log("Fetched results:", results.length); // Debugging output
  return results;
}


export async function updateStoreHours(
  shop: string,
  weekday: number,
  open_time: number | null,
  close_time: number | null,
  is_closed: boolean
) {
  try {
    // Ensure the record exists first
    const existingRecord = await prisma.storeHours.findUnique({
      where: {
        shop_weekday: { shop, weekday }, // Use the composite unique key
      },
    });

    if (existingRecord) {
      // Update existing record
      return await prisma.storeHours.update({
        where: { shop_weekday: { shop, weekday } },
        data: { open_time, close_time, is_closed },
      });
    } else {
      // Create a new record for the shop + weekday combination
      return await prisma.storeHours.create({
        data: { shop, weekday, open_time, close_time, is_closed, timezone: "America/Los_Angeles" },
      });
    }
  } catch (error) {
    console.error("Error in updateStoreHours:", error);
    throw new Error("Database error while updating store hours");
  }
}
