import { json } from "@remix-run/node";
import { getStoreHours } from "../models/storeHours.server"; // Fetch store hours from DB

export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop") || "default_shop"; // Fallback for testing

    const storeHours = await getStoreHours(shop); // ✅ Now passing shop as an argument
    const now = new Date();

    const currentHour = now.getHours();
    const isOpen = currentHour >= storeHours.open_time && currentHour < storeHours.close_time;

    return json({ isOpen });
}
