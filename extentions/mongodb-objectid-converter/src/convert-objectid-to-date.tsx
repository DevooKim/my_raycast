
/**
 * TODO: List 기반으로 변경하기
 */
import { Form, ActionPanel, Action, Icon } from "@raycast/api";
import { useMemo, useState } from "react";
import { ObjectId } from "mongodb";
import copyToClipboard from "./utils/copyToClipboard";

export default function Command() {
  const [objectId, setObjectId] = useState<string>(ObjectId.createFromTime(new Date().getTime() / 1000).toHexString());

  const timestamp = useMemo(() => {
    try {
      return new ObjectId(objectId).getTimestamp();
    } catch {
      return null;
    }
  }, [objectId]);

  const dateGroup = useMemo(() => {
    const date = timestamp ? new Date(timestamp) : null;
    if (!date) {
      return null;
    }

    return {
      timestamp: date.getTime().toString(),
      localTime: date.toLocaleString("ko-KR"),
      utcTime: date.toUTCString(),
    };
  }, [timestamp]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Copy timestamp"
            onSubmit={() => copyToClipboard(dateGroup?.timestamp || "", "Copied timestamp")}
            icon={Icon.CopyClipboard}
          />
          <Action.SubmitForm
            title="Copy local time"
            onSubmit={() => copyToClipboard(dateGroup?.localTime || "", "Copied local time")}
            icon={Icon.CopyClipboard}
          />
          <Action.SubmitForm
            title="Copy utc time"
            onSubmit={() => copyToClipboard(dateGroup?.utcTime || "", "Copied utc time")}
            icon={Icon.CopyClipboard}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="objectId" title="ObjectId" value={objectId} onChange={setObjectId} />
      <Form.Separator />
      <Form.Description title="timestamp" text={dateGroup?.timestamp || ""} />
      <Form.Description title="local time" text={dateGroup?.localTime || ""} />
      <Form.Description title="utc time" text={dateGroup?.utcTime || ""} />
    </Form>
  );
}
