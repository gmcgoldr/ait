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
        <p>
          Ait is a technical exploration of an idea relating to incorporating
          long-term memory in applications using large language model (LLM). See{" "}
          <a href="https://github.com/gmcgoldr/ait">the repository</a> for more
          information.
        </p>
        <p>
          To use this demo, you need an OpenAI account and API key. You can find
          out more <a href="https://platform.openai.com/">here</a>.
        </p>
        <p>
          The demo comes with some pre-loaded <em>experiences</em>. These are
          queries and responses relating to buoyancy. Go ahead and ask it: "Does
          a pear sink in water?".
        </p>
        <p>
          This is a question which challenges Chat GPT as it tends to fabricate
          an answer, and can easily be made to answer yes or no. Experiment with
          various contexts to see how they impact the response.
        </p>
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
