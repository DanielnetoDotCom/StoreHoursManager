import { json } from "@remix-run/node";
import { getStoreHours } from "../models/storeHours.server";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Shop parameter is missing" }, { status: 400 });
  }

  const storeHours = await getStoreHours(shop);
  if (!storeHours || storeHours.length === 0) {
    return json({ error: "No store hours found for this shop" }, { status: 404 });
  }

  // Get the timezone from the first entry (assuming it's consistent across all days)
  const timezone = storeHours[0].timezone || "UTC";

  // Get current date and time in the store's timezone

  const now = new Date();
  const localTime = now.toLocaleString("en-US", { timeZone: timezone });
  const currentDateTime = new Date(localTime);
  const currentWeekday = (currentDateTime.getDay() + 6) % 7; // Convert Sunday-Saturday (0-6) to Monday-Sunday (1-7) then adjust to (0-6)
  const currentTime = currentDateTime.getHours() * 100 + currentDateTime.getMinutes(); // Convert to HHMM format


  // Find today's hours
  const todayHours = storeHours.find(sh => sh.weekday === currentWeekday);

  if (!todayHours || todayHours.is_closed) {
    return json({
      isOpen: false, message: "Store is closed today", timezone,
      now: currentTime,
      //open_time: todayHours.open_time,
      //close_time: todayHours.close_time,
      //hours: storeHours
    });
  }

  // Check if the current time is within open hours
  const isOpen = todayHours.open_time !== null && todayHours.close_time !== null &&
    todayHours.open_time <= currentTime && currentTime <= todayHours.close_time;

  return json({
    isOpen,
    message: isOpen ? "Store is open" : "Store is closed",
    timezone,
    now: currentTime,
    open_time: todayHours.open_time,
    close_time: todayHours.close_time,
    //hours: storeHours
  });
}
