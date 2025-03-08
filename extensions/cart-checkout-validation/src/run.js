export function run(input) {
  console.log("🔍 Starting validation...");

  // Get store hours metafield
  const storeInfoMetafield = input.shop.storeHours?.value;
  if (!storeInfoMetafield) {
    console.error("❌ Store hours metafield is missing!");
    return { errors: [{ localizedMessage: "Store hours are not available.", target: "$.cart" }] };
  }

  // Get current time from metafield
  const currentTimeMetafield = input.shop.currentTime?.value;
  if (!currentTimeMetafield) {
    console.error("❌ Current time metafield is missing!");
    return { errors: [{ localizedMessage: "Current time data is missing.", target: "$.cart" }] };
  }

  console.log("✅ Store hours and current time metafields found.");

  // Parse metafields
  let storeHours, utcTime;
  try {
    storeHours = JSON.parse(storeInfoMetafield);
    utcTime = JSON.parse(currentTimeMetafield).utcTime;
  } catch (error) {
    console.error("❌ Error parsing metafields:", error);
    return { errors: [{ localizedMessage: "Error processing store data.", target: "$.cart" }] };
  }

  // Convert UTC time string to Date object
  const utcDate = new Date(utcTime);
  if (isNaN(utcDate.getTime())) {
    console.error("❌ Invalid UTC Date:", utcTime);
    return { errors: [{ localizedMessage: "Invalid UTC time data.", target: "$.cart" }] };
  }

  console.log(`✅ Parsed UTC Time: ${utcTime}`);
  console.log(`✅ Converted UTC Date: ${utcDate}`);

  // Get current weekday in UTC
  const utcWeekday = utcDate.getUTCDay();
  const weekdayName = getWeekdayName(utcWeekday);

  console.log(`✅ UTC Weekday: ${weekdayName} (${utcWeekday})`);

  // Find today's store hours
  const todayHours = storeHours.find((sh) => sh.weekday === utcWeekday);
  if (!todayHours) {
    console.error(`❌ No store hours found for ${weekdayName}`);
    return {
      errors: [{ localizedMessage: `No store hours found for today. (Weekday: ${weekdayName})`, target: "$.cart" }],
    };
  }

  console.log(`✅ Found store hours for ${weekdayName}:`, JSON.stringify(todayHours) );

  // Ensure the store is not marked as closed
  if (todayHours.is_closed) {
    console.log(`⚠️ Store is marked as CLOSED for ${weekdayName}`);
    return {
      errors: [
        {
          localizedMessage: `The store is closed today. (${weekdayName})`,
          target: "$.cart",
        },
      ],
    };
  }
  console.log(`✅ Found store not set to close:`, JSON.stringify(todayHours.is_closed) );
  // Extract hours and minutes from UTC time
  const localHour = utcDate.getUTCHours();
  const localMinute = utcDate.getUTCMinutes();
  const formattedLocalTime = formatTime(localHour, localMinute);

  console.log(`✅ Current UTC Time (HH:MM): ${formattedLocalTime}`);

  // Convert open and close times to HH:mm format
  const openTime = formatHour(todayHours.open_time);
  const closeTime = formatHour(todayHours.close_time);

  console.log(`✅ Open Time: ${openTime}, Close Time: ${closeTime}`);

  // Convert time to HHMM format for comparison
  const currentTimeHHMM = localHour * 100 + localMinute;
  const openTimeHHMM = todayHours.open_time * 100; // Ensure open_time is in correct HHMM format
  const closeTimeHHMM = todayHours.close_time * 100;

  console.log(`✅ Current Time in HHMM Format: ${currentTimeHHMM}`);
  console.log(`✅ Open Time in HHMM Format: ${openTimeHHMM}, Close Time in HHMM Format: ${closeTimeHHMM}`);

  // Check if the store is open
  const isOpen =
    todayHours.open_time !== null &&
    todayHours.close_time !== null &&
    openTimeHHMM <= currentTimeHHMM &&
    currentTimeHHMM <= closeTimeHHMM;

  if (!isOpen) {
    console.log(`⚠️ Store is currently closed! Current Time: ${formattedLocalTime}, Opens: ${openTime}, Closes: ${closeTime}`);
    return {
      errors: [
        {
          localizedMessage: `The store is currently closed. (${weekdayName}, Time: ${formattedLocalTime}). Opens: ${openTime} - Closes: ${closeTime}`,
          target: "$.cart",
        },
      ],
    };
  }

  console.log("✅ Store is open, checkout allowed.");
  return { errors: [] }; // Store is open, allow checkout
}

/**
 * Converts hours and minutes into "HH:mm" format.
 */
function formatTime(hours, minutes) {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Converts HHMM integer format (e.g., 9) to "HH:00" format.
 */
function formatHour(hour) {
  return hour !== null ? `${String(hour).padStart(2, "0")}:00` : "N/A";
}

/**
 * Returns the weekday name from a given UTC weekday index (0 = Sunday, 6 = Saturday).
 */
function getWeekdayName(weekday) {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return weekdays[weekday] || "Unknown";
}
