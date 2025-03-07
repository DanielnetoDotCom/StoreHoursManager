import { json } from "@remix-run/node";
import { getStoreHours, updateStoreHours } from "../models/storeHours.server";

export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop") || "default_shop";

    const storeHours = await getStoreHours(shop);
    return json(storeHours);
}

export async function action({ request }: { request: Request }) {
    const shop = "default_shop"; // Replace with Shopify session handling
    const body = await request.json();

    const updatedHours = await updateStoreHours(shop, body.open_time, body.close_time, body.timezone);
    return json(updatedHours);
}
