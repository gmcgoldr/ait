import { Container } from "@mui/material";

import { AppTitle } from "./AppTitle";
import { AppAlert, AppAlertProps } from "./AppAlert";
import { WriteQuery, WriteQueryProps } from "./WriteQuery";
import { EditContext, EditContextProps } from "./EditContext";
import { EditResponse, EditResponseProps } from "./EditResponse";
import { Settings, SettingsProps } from "./Settings";

export interface QueryProps {
  appAlertProps: AppAlertProps;
  writeQueryProps: WriteQueryProps;
  editContextProps: EditContextProps;
  editResponseProps: EditResponseProps;
  settingsProps: SettingsProps;
}

export function Query(props: QueryProps) {
  return (
    <>
      <AppTitle />
      <AppAlert {...props.appAlertProps} />
      <Container maxWidth="md">
        <h2>Query</h2>
        <WriteQuery {...props.writeQueryProps} />
        <h2>Context</h2>
        <EditContext {...props.editContextProps} />
        <h2>Response</h2>
        <EditResponse {...props.editResponseProps} />
        <h2>Settings</h2>
        <Settings {...props.settingsProps} />
      </Container>
    </>
  );
}
