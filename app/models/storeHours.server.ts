import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

// Function to update the Shopify metafield with store hours data

async function updateStoreMetafield(shop: string) {
  try {
    // Step 1: Fetch the Shop ID
    const shopResponse = await axios.post(
      `https://${process.env.SHOPIFY_SHOP}/admin/api/2023-10/graphql.json`,
      {
        query: `query { shop { id } }`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
      }
    );

    const shopId = shopResponse.data.data.shop.id;
    console.log("Shop ID:", shopId);

    // Step 2: Fetch all store hours from the database
    const allStoreData = await prisma.storeHours.findMany({
      where: { shop },
      orderBy: [{ weekday: "asc" }],
    });

    // Step 3: Convert the data to a proper JSON string
    const jsonValue = JSON.stringify(allStoreData);

    // Step 4: GraphQL Mutation (proper JSON formatting)
    const query = `
      mutation {
        metafieldsSet(
          metafields: [
            {
              namespace: "store_status"
              key: "store_info"
              type: "json"
              value: "${jsonValue.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
              ownerId: "${shopId}"
            }
          ]
        ) {
          metafields {
            id
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Step 5: Send the request to Shopify API
    const response = await axios.post(
      `https://${process.env.SHOPIFY_SHOP}/admin/api/2023-10/graphql.json`,
      { query },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
      }
    );

    // Step 6: Handle response and errors
    if (response.data.data.metafieldsSet.userErrors.length > 0) {
      console.error("Metafield update errors:", response.data.data.metafieldsSet.userErrors);
    } else {
      console.log("Metafield Updated Successfully:", response.data.data.metafieldsSet.metafields);
    }
  } catch (error: any) {
    console.error("Error updating metafield:", error.response?.data || error.message);
  }
}



export async function getStoreHours(shop: string) {
  console.log("Fetching store hours for shop:", shop);

  const results = await prisma.storeHours.findMany({
    where: { shop },
    orderBy: [{ weekday: "asc" }],
  });

  console.log("getStoreHours:", shop);
  console.log("Fetched results:", results.length);
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
    const existingRecord = await prisma.storeHours.findUnique({
      where: {
        shop_weekday: { shop, weekday },
      },
    });

    let updatedRecord;

    if (existingRecord) {
      updatedRecord = await prisma.storeHours.update({
        where: { shop_weekday: { shop, weekday } },
        data: { open_time, close_time, is_closed },
      });
    } else {
      updatedRecord = await prisma.storeHours.create({
        data: { shop, weekday, open_time, close_time, is_closed, timezone: "America/Los_Angeles" },
      });
    }

    // Update metafield with the new store hours data
    await updateStoreMetafield(shop);

    return updatedRecord;
  } catch (error) {
    console.error("Error in updateStoreHours:", error);
    throw new Error("Database error while updating store hours");
  }
}
