import { Form, ActionPanel, Action, Icon } from "@raycast/api";
import { useState } from "react";
import { ObjectId } from "mongodb";
import copyToClipboard from "./utils/copyToClipboard";

type Values = {
  timestamp: string;
  dateString: string;
  withObjectId: boolean;
};

export default function Command() {
  const [referenceDate, setReferenceDate] = useState<Date | null>(new Date());
  const [timestamps, setTimestamps] = useState<string>(referenceDate ? referenceDate.getTime().toString() : "");
  const [dateString, setdateString] = useState<string>(referenceDate ? referenceDate.toISOString() : "");

  const objectId = ObjectId.createFromTime(referenceDate ? referenceDate.getTime() / 1000 : 0);
  const localTime = referenceDate ? referenceDate.toLocaleString("ko-KR") : "";
  const utcTime = referenceDate ? referenceDate.toUTCString() : "";

  const handleTimestampChange = (value: string) => {
    setTimestamps(value);

    const date = new Date(parseInt(value));
    if (isNaN(date.getTime())) {
      setdateString("");
      setReferenceDate(null);
      return;
    }

    setReferenceDate(date);
    setdateString(date.toISOString());
  };

  const handleDateStringChange = (value: string) => {
    setdateString(value);

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      setTimestamps("");
      setReferenceDate(null);
      return;
    }

    setReferenceDate(date);
    setTimestamps(date.getTime().toString());
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Copy Objectid"
            onSubmit={(value: Values) =>
              copyToClipboard(value.withObjectId ? `ObjectId("${objectId}")` : objectId.toString(), "Copied ObjectId")
            }
            icon={Icon.CopyClipboard}
          />
          <Action.SubmitForm
            title="Copy Timestamp"
            onSubmit={(value: Values) => copyToClipboard(value.timestamp, "Copied Timestamp")}
            icon={Icon.CopyClipboard}
            shortcut={{ modifiers: ["cmd"], key: "t" }}
          />
          <Action.SubmitForm
            title="Copy Local Time"
            onSubmit={() => copyToClipboard(localTime, "Copied Local Time")}
            icon={Icon.CopyClipboard}
            shortcut={{ modifiers: ["cmd"], key: "l" }}
          />
          <Action.SubmitForm
            title="Copy UTC Time"
            onSubmit={() => copyToClipboard(utcTime, "Copied UTC Time")}
            icon={Icon.CopyClipboard}
            shortcut={{ modifiers: ["cmd"], key: "u" }}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="This form showcases all available form elements." />
      <Form.TextField
        id="dateString"
        title="date string"
        placeholder="yyyy-mm-ddThh:mm:ssZ"
        info="Date 객체에 들어갈 수 있는 문자열"
        value={dateString}
        onChange={handleDateStringChange}
      />
      <Form.TextField id="timestamp" title="timestamp" value={timestamps} onChange={handleTimestampChange} />
      <Form.Separator />
      <Form.Description title="local time" text={localTime} />
      <Form.Description title="UTC time" text={utcTime} />
      <Form.Description title="objectId" text={objectId.toString()} />

      <Form.Checkbox
        id="withObjectId"
        label="Copy with ObjectId"
        info="결과값을 ObjectId로 감싸서 복사합니다."
        storeValue
      />
    </Form>
  );
}
