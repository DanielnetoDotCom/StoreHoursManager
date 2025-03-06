import { json, type ActionFunction, type LoaderFunction } from "@remix-run/node";

let storeHours = {
  open_time: 9,
  close_time: 17,
  timezone: "America/Los_Angeles",
};

// Loader function to fetch store hours
export const loader: LoaderFunction = async () => {
  return json(storeHours);
};

// Action function to update store hours
export const action: ActionFunction = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const data = await request.json();
    storeHours = {
      open_time: data.open_time,
      close_time: data.close_time,
      timezone: data.timezone,
    };
    return json({ success: true });
  } catch (error) {
    return json({ error: "Invalid data" }, { status: 400 });
  }
};
