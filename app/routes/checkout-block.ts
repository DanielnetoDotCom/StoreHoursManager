import { json } from "@remix-run/node";
import { getStoreHours } from "../models/storeHours.server";

export async function action({ request }: { request: Request }) {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
        return json({ error: "Missing shop parameter" }, { status: 400 });
    }

    const storeHours = await getStoreHours(shop); // ✅ Now passing shop as an argument
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < storeHours.open_time || currentHour >= storeHours.close_time) {
        return json({ error: "Store is currently closed." }, { status: 400 });
    }

    return json({ success: true });
}
