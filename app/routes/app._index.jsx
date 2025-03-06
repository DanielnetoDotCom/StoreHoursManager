import { useEffect, useState } from "react";
import { Page, Card, Form, FormLayout, Select, Button, TextField, Text, Icon, Toast, Frame } from "@shopify/polaris";
import { DateTime } from "luxon";
import { ClockIcon, CalendarIcon, GlobeIcon } from "@shopify/polaris-icons";

export default function StoreHoursSettings() {
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("17:00");
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [currentTime, setCurrentTime] = useState("");
  const [toastActive, setToastActive] = useState(false);

  // Fetch store hours from API
  const fetchStoreHours = async () => {
    try {
      const res = await fetch("/api/store-hours");
      if (!res.ok) {
        throw new Error("Failed to fetch store hours");
      }
      const data = await res.json();
      setOpenTime(data.open_time.toString().padStart(2, "0") + ":00");
      setCloseTime(data.close_time.toString().padStart(2, "0") + ":00");
      setTimezone(data.timezone || "America/Los_Angeles");
    } catch (error) {
      console.error("Error fetching store hours:", error);
    }
  };

  useEffect(() => {
    fetchStoreHours();
  }, []);

  useEffect(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000); // Update every second
    return () => clearInterval(interval);
  }, [timezone]);

  const updateCurrentTime = () => {
    const now = DateTime.now().setZone(timezone);
    setCurrentTime(now.toFormat("HH:mm:ss"));
  };

  const saveSettings = async () => {
    const body = {
      open_time: parseInt(openTime.split(":")[0]),
      close_time: parseInt(closeTime.split(":")[0]),
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
        fetchStoreHours(); // Fetch updated store hours after saving
      }
    } catch (error) {
      console.error("Error saving store hours:", error);
    }
  };

  return (
    <Frame>
      <Page title="Store Hours Settings">
        <Card sectioned>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <Text variant="headingMd">
              <Icon source={ClockIcon} /> Current Time
            </Text>
            <Text variant="bodyMd" fontWeight="bold">
              {currentTime} ({timezone})
            </Text>
          </div>
          <Text variant="bodyMd">The current time in your selected timezone.</Text>
        </Card>

        <Card sectioned>
          <Form onSubmit={saveSettings}>
            <FormLayout>
              <TextField
                label={<><Icon source={CalendarIcon} /> Open Time</>}
                value={openTime}
                type="time"
                autoComplete="off"
                onChange={setOpenTime}
              />
              <TextField
                label={<><Icon source={CalendarIcon} /> Close Time</>}
                value={closeTime}
                type="time"
                autoComplete="off"
                onChange={setCloseTime}
              />
              <Select
                label={<><Icon source={GlobeIcon} /> Timezone</>}
                options={[
                  { label: "New York (EST)", value: "America/New_York" },
                  { label: "Los Angeles (PST) - Default", value: "America/Los_Angeles" },
                  { label: "London (GMT)", value: "Europe/London" },
                ]}
                onChange={(value) => setTimezone(value)}
                value={timezone}
              />
              <Button submit variant="primary">
                Save Store Hours
              </Button>
            </FormLayout>
          </Form>
        </Card>

        {toastActive && (
          <Toast content="Store hours saved successfully!" onDismiss={() => setToastActive(false)} />
        )}
      </Page>
    </Frame>
  );
}
