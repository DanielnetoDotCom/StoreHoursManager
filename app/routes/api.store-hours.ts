import { json } from "@remix-run/node";
import { getStoreHours, updateStoreHours } from "../models/storeHours.server";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "default_shop";

  const storeHours = await getStoreHours(shop);
  return json({ hours: storeHours });
}

export async function action({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return json({ error: "Shop parameter is missing" }, { status: 400 });
    }

    console.log("Saving store hours for shop:", shop);

    const body = await request.json();

    const updates = body.hours.map(async (day: { weekday: number; open_time: number | null; close_time: number | null; is_closed: boolean; }) => {
      return await updateStoreHours(shop, day.weekday, day.open_time, day.close_time, day.is_closed);
    });

    await Promise.all(updates);

    return json({ success: true });
  } catch (error) {
    console.error("Error updating store hours:", error);
    return json({ error: "Failed to update store hours" }, { status: 500 });
  }
}

