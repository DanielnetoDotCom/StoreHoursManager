import { useEffect, useState } from "react";
import {
  Page, Card, Form, FormLayout, Select, Button, TextField, Text, Icon, Toast, Frame, Checkbox, BlockStack, InlineStack, Grid
} from "@shopify/polaris";
import { ClockIcon, CalendarIcon, GlobeIcon } from "@shopify/polaris-icons";
import { DateTime } from "luxon";

export default function StoreHoursSettings() {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const [storeHours, setStoreHours] = useState(
    Array.from({ length: 7 }, (_, index) => ({
      weekday: index,
      open_time: "09:00",
      close_time: "17:00",
      is_closed: false,
    }))
  );
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [currentTime, setCurrentTime] = useState("");
  const [currentWeekday, setCurrentWeekday] = useState("");
  const [toastActive, setToastActive] = useState(false);

  useEffect(() => {
    fetchStoreHours();
  }, []);

  useEffect(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  const fetchStoreHours = async () => {
    try {
      const res = await fetch("/api/store-hours");
      if (!res.ok) throw new Error("Failed to fetch store hours");

      const data = await res.json();

      const updatedStoreHours = Array.from({ length: 7 }, (_, index) => {
        const existingDay = data.hours.find(h => h.weekday === index);
        return existingDay
          ? {
              weekday: index,
              open_time: existingDay.open_time !== null ? String(existingDay.open_time).padStart(2, "0") + ":00" : "09:00",
              close_time: existingDay.close_time !== null ? String(existingDay.close_time).padStart(2, "0") + ":00" : "17:00",
              is_closed: existingDay.is_closed
            }
          : {
              weekday: index,
              open_time: "09:00",
              close_time: "17:00",
              is_closed: false
            };
      });

      setStoreHours(updatedStoreHours);
      setTimezone(data.timezone || "America/Los_Angeles");
    } catch (error) {
      console.error("Error fetching store hours:", error);
    }
  };

  const updateCurrentTime = () => {
    const now = DateTime.now().setZone(timezone);
    setCurrentTime(now.toFormat("HH:mm:ss"));
    setCurrentWeekday(now.toFormat("EEEE"));
  };

  const handleChange = (index, field, value) => {
    const updatedHours = [...storeHours];
    updatedHours[index][field] = value;
    setStoreHours(updatedHours);
  };

  const handleCheckboxChange = (index) => {
    const updatedHours = [...storeHours];
    updatedHours[index].is_closed = !updatedHours[index].is_closed;
    setStoreHours(updatedHours);
  };

  const saveSettings = async () => {
    const body = {
      hours: storeHours.map((h, index) => ({
        weekday: index,
        open_time: h.is_closed ? null : parseInt(h.open_time.split(":")[0]),
        close_time: h.is_closed ? null : parseInt(h.close_time.split(":")[0]),
        is_closed: h.is_closed,
      })),
      timezone,
    };

    try {
      const response = await fetch("/api/store-hours", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setToastActive(true);
        fetchStoreHours();
      } else {
        console.error("Failed to save store hours");
      }
    } catch (error) {
      console.error("Error saving store hours:", error);
    }
  };

  return (
    <Frame>
      <Page title="Store Hours Settings">
        {/* Current Time Display */}
        <Card sectioned>
          <BlockStack gap="tight">
            <InlineStack align="space-between">
              <Text variant="headingMd">
                <Icon source={ClockIcon} /> Current Time
              </Text>
              <Text variant="bodyMd" fontWeight="bold">
                {currentTime} ({timezone}) - {currentWeekday}
              </Text>
            </InlineStack>
            <Text variant="bodyMd">The current time in your selected timezone.</Text>
          </BlockStack>
        </Card>

        {/* Store Hours Form */}
        <Card sectioned>
          <Form onSubmit={saveSettings}>
            <FormLayout>
              {/* Timezone Selection */}
              <Select
                label="Timezone"
                options={[
                  { label: "New York (EST)", value: "America/New_York" },
                  { label: "Los Angeles (PST) - Default", value: "America/Los_Angeles" },
                  { label: "London (GMT)", value: "Europe/London" },
                ]}
                onChange={(value) => setTimezone(value)}
                value={timezone}
              />

              {/* Responsive Grid to avoid squished inputs */}
              <Grid columns={{ xs: 1, sm: 2, md: 3, lg: 7, xl: 7 }} gap="loose">
                {weekdays.map((day, index) => (
                  <Card key={index} sectioned>
                    <BlockStack gap="tight">
                      <Text variant="headingMd">{day}</Text>
                      <Checkbox
                        label="Closed"
                        checked={storeHours[index].is_closed}
                        onChange={() => handleCheckboxChange(index)}
                      />
                      {!storeHours[index].is_closed && (
                        <InlineStack align="center" gap="tight">
                          <TextField
                            label="Open"
                            value={storeHours[index].open_time}
                            type="time"
                            autoComplete="off"
                            onChange={(value) => handleChange(index, "open_time", value)}
                          />
                          <TextField
                            label="Close"
                            value={storeHours[index].close_time}
                            type="time"
                            autoComplete="off"
                            onChange={(value) => handleChange(index, "close_time", value)}
                          />
                        </InlineStack>
                      )}
                    </BlockStack>
                  </Card>
                ))}
              </Grid>

              {/* Save Button */}
              <div style={{ textAlign: "center", marginTop: "20px"}}>
                <Button submit variant="primary" fullWidth>Save Store Hours</Button>
              </div>
            </FormLayout>
          </Form>
        </Card>

        {toastActive && <Toast content="Store hours saved successfully!" onDismiss={() => setToastActive(false)} />}
      </Page>
    </Frame>
  );
}
