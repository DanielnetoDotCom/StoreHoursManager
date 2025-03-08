export function run(input) {
  // Get store metafield (previously stored in Shopify)
  const storeInfoMetafield = input.shop.metafield?.value;

  if (!storeInfoMetafield) {
    return {
      errors: [
        {
          localizedMessage: "Store hours are not available.",
          target: "$.cart",
        },
      ],
    };
  }

  // Parse the JSON data stored in the metafield
  const storeHours = JSON.parse(storeInfoMetafield);

  if (!Array.isArray(storeHours) || storeHours.length === 0) {
    return {
      errors: [
        {
          localizedMessage: "Invalid store hours format.",
          target: "$.cart",
        },
      ],
    };
  }

  // Get the current date in the shop's timezone
  const shopDate = input.shop.localTime.date;
  console.log(`Shop Date: ${shopDate}`);

  // Extract the weekday from the date
  const [year, month, day] = shopDate.split("-").map(Number);
  const currentWeekday = getWeekday(year, month, day);
  console.log(`Current Weekday: ${currentWeekday}`);

  // Find today's store hours
  const todayHours = storeHours.find((sh) => sh.weekday === currentWeekday);

  if (!todayHours || todayHours.is_closed) {
    return {
      errors: [
        {
          localizedMessage: `The store is closed today. (Weekday: ${currentWeekday})`,
          target: "$.cart",
        },
      ],
    };
  }

  // Get the current time in HHMM format
  const now = new Date();
  const currentHour = now.getUTCHours(); // Use UTC to avoid time shift issues
  const currentMinute = now.getUTCMinutes();
  const currentTime = currentHour * 100 + currentMinute;

  console.log(`Current Time: ${currentTime} (HHMM)`);

  // Check if the store is open now
  const isOpen =
    todayHours.open_time !== null &&
    todayHours.close_time !== null &&
    todayHours.open_time <= currentTime &&
    currentTime <= todayHours.close_time;

  if (!isOpen) {
    return {
      errors: [
        {
          localizedMessage: `The store is currently closed. (Weekday: ${currentWeekday}). Opens: ${todayHours.open_time} - Closes: ${todayHours.close_time}`,
          target: "$.cart",
        },
      ],
    };
  }

  return { errors: [] }; // Store is open, allow checkout
}

/**
 * Returns the weekday (0 = Sunday, 6 = Saturday) from a given date.
 */
function getWeekday(year, month, day) {
  const referenceDate = new Date(Date.UTC(year, month - 1, day));
  return referenceDate.getUTCDay(); // Returns 0 (Sunday) to 6 (Saturday)
}
