import { useCachedPromise } from "@raycast/utils";
import { clearStorage, getStorage, removeItem } from "./utils/storage";
import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";

export default function RunPreset() {
  const { data } = useCachedPromise(() => getStorage(), []);

  return (
    <List isLoading={data === undefined}>
      {Array.from(data || []).map((preset, index) => (
        <List.Item
          key={`${preset.name}-${index}`}
          title={preset.name}
          subtitle={preset.keyword}
          actions={
            <ActionPanel>
              <Action
                title="Remove"
                icon="trash"
                // shortcut={{ modifiers: ["cmd"], key: "d" }}
                onAction={async () => {
                  await removeItem(index);
                }}
              />
              <Action
                title="Clear"
                icon="trash"
                // shortcut={{ modifiers: ["cmd"], key: "d" }}
                onAction={async () => {
                  await clearStorage();
                }}
              />
            </ActionPanel>
          }
          accessories={[
            { text: `An Accessory Text`, icon: Icon.Hammer },
            { text: { value: `A Colored Accessory Text`, color: Color.Orange }, icon: Icon.Hammer },
            { icon: Icon.Person, tooltip: "A person" },
            { text: "Just Do It!" },
            { date: new Date() },
            { tag: new Date() },
            { tag: { value: new Date(), color: Color.Magenta } },
            { tag: { value: "User", color: Color.Magenta }, tooltip: "Tag with tooltip" },
          ]}
        />
      ))}
    </List>
  );
}
