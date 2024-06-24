import { Action, ActionPanel, Form, LaunchProps, getApplications, getDefaultApplication } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { Preset, setStorage } from "./utils/storage";

export default function CreatePreset(props: LaunchProps<{ draftValues: Preset }>) {
  const { draftValues } = props;

  const { isLoading: isLoadingDefaultBrowser, data: defaultBrowser } = useCachedPromise(
    () => getDefaultApplication("https://raycast.com"),
    [],
  );
  const { isLoading: isLoadingBrowserList, data: browserList } = useCachedPromise(
    () => getApplications("https://raycast.com"),
    [],
  );

  return (
    <Form
      enableDrafts
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create" onSubmit={setStorage} />
        </ActionPanel>
      }
      isLoading={isLoadingDefaultBrowser || isLoadingBrowserList}
    >
      <Form.Dropdown id="name" title="Browser" defaultValue={draftValues?.name || defaultBrowser?.name}>
        {browserList?.map((browser) => (
          <Form.Dropdown.Item key={browser.bundleId} value={browser.name} title={browser.name} />
        ))}
      </Form.Dropdown>
      <Form.TextField
        id="keyword"
        title="KEYWORD"
        info="Refresh browser tabs whose URLs include the keyword. REGEX is supported."
        defaultValue={draftValues?.keyword || ""}
      />
      <Form.Separator />
      <Form.Dropdown id="mode" title="Mode" defaultValue={draftValues?.mode || "All Windows"}>
        <Form.Dropdown.Item value="All Windows" title="All Windows" />
        <Form.Dropdown.Item value="Active Window" title="Latest Active Window" />
      </Form.Dropdown>
    </Form>
  );
}
