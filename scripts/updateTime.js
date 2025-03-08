import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

console.log("SHOPIFY_SHOP:", process.env.SHOPIFY_SHOP);
console.log("SHOPIFY_ACCESS_TOKEN:", process.env.SHOPIFY_ACCESS_TOKEN ? "Exists" : "Not Set");

// Cache store ID and timezone in memory
let cachedShopId = process.env.SHOPIFY_STORE_ID || null;
let cachedShopTimezone = null;

async function fetchShopDetails() {
  if (cachedShopId && cachedShopTimezone) {
    console.log("✅ Using Cached Shop ID & Timezone:", cachedShopId, cachedShopTimezone);
    return { shopId: cachedShopId, timezone: cachedShopTimezone };
  }

  console.log("🔄 Fetching Shopify Store ID and Timezone...");
  try {
    const response = await axios.post(
      `https://${process.env.SHOPIFY_SHOP}/admin/api/2023-10/graphql.json`,
      {
        query: `query { shop { id } }`, // Shopify no longer provides timezoneOffsetMinutes
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
      }
    );

    const shopId = response.data.data.shop.id;
    cachedShopId = shopId;
    console.log("✅ Fetched and Cached Shop ID:", cachedShopId);

    return { shopId, timezone: "UTC" }; // Always store time in UTC
  } catch (error) {
    console.error("❌ Failed to fetch Shopify Store details:", error.response?.data || error.message);
    throw error;
  }
}

async function updateCurrentTimeMetafield() {
  try {
    const { shopId, timezone } = await fetchShopDetails();

    if (!shopId) {
      console.error(`SHOPIFY_STORE_ID is not available`);
      throw new Error("❌ SHOPIFY_STORE_ID is not available.");
    }

    // Get current UTC time in ISO 8601 format
    const nowUtc = new Date().toISOString(); // Always store in UTC

    console.log(`✅ Updating Current Time: ${nowUtc} (UTC)`);

    // GraphQL Mutation to update time in UTC
    const query = `
      mutation {
        metafieldsSet(
          metafields: [
            {
              namespace: "store_status"
              key: "current_time"
              type: "json"
              value: """{
                "utcTime": "${nowUtc}",
                "timezone": "${timezone}"
              }"""
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

    // Send request to Shopify API
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

    // Ensure response contains `metafieldsSet`
    if (!response.data || !response.data.data || !response.data.data.metafieldsSet) {
      console.error(`❌ metafieldsSet is missing from the API response`);
      throw new Error("❌ metafieldsSet is missing from the API response.");
    }

    // Handle any Shopify API errors
    if (response.data.data.metafieldsSet.userErrors.length > 0) {
      console.error("❌ Shopify Metafield Update Errors:", response.data.data.metafieldsSet.userErrors);
    } else {
      console.log("✅ Metafield Updated Successfully:", response.data.data.metafieldsSet.metafields);
    }
  } catch (error) {
    console.error("❌ API Request Failed:", error.response?.data || error.message);
  }
}

// Export function so it can be started from the main app
export function startUpdatingTime() {
  updateCurrentTimeMetafield(); // Run once at startup
  setInterval(updateCurrentTimeMetafield, 60000); // Run every 60 sec
}
