import { useEffect, useState } from "react";
import { WriteQuery, WriteQueryProps } from "./WriteQuery";
import { EditContext, EditContextProps } from "./EditContext";
import { EditResponse, EditResponseProps } from "./EditResponse";
import {
  Alert,
  AppBar,
  Container,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import { Settings, SettingsProps } from "./Settings";
import * as Ait from "ait-lib";

import { buildExperienceFromId, Embedded } from "./utils";

export function App() {
  let [history, setHistory] = useState<Ait.History>(Ait.History.load());
  let [query, setQuery] = useState<string>();
  let [queryEmbedded, setQueryEmbedded] = useState<Embedded>();
  let [contextIds, setContextIds] = useState<Uint8Array[]>();
  let [response, setResponse] = useState<string>();
  let [token, setToken] = useState<string>();
  let [errorMessage, setErrorMessage] = useState<string | undefined>();
  let [queryLoading, setQueryLoading] = useState<boolean>(false);
  let [contextLoading, setContextLoading] = useState<boolean>(false);

  function onExit() {
    if (document.visibilityState === "hidden") {
      (async () => {
        history.store();
      })().catch((x) => console.error(x));
    }
  }

  useEffect(() => {
    addEventListener("visibilitychange", onExit);
    return function cleanup() {
      removeEventListener("visibilitychange", onExit);
    };
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (token == null) return;
    setToken(token);
  }, []);

  let queryDisabledReason = undefined;
  if (token == null) queryDisabledReason = "No API token has been provided.";

  const writeQueryProps: WriteQueryProps | undefined = {
    query,
    setQuery,
    disabledReason: queryDisabledReason,
    loading: queryLoading,
    buildExperienceFromId: (id) => buildExperienceFromId(id, history),
    submit: () => {
      if (!token || !query) return;
      setQueryLoading(true);
      (async () => {
        const embedding = await Ait.gpt_embed(token, query);
        setQueryEmbedded({ text: query, embedding });
        setContextIds(history.related_ids(embedding, 128));
        setResponse(undefined);
      })()
        .catch((x) => {
          console.error(x);
          setErrorMessage("Unable process query.");
        })
        .finally(() => setQueryLoading(false));
    },
    clearQuery: () => {
      setResponse(undefined);
      setContextIds(undefined);
      setQueryEmbedded(undefined);
      setQuery(undefined);
    },
  };

  let contextDisabledReason = undefined;
  if (token == null) contextDisabledReason = "No API token has been provided.";
  else if (contextIds == null)
    contextDisabledReason = "Context IDs not generated.";

  const editContextProps: EditContextProps = {
    contextIds,
    disabledReason: contextDisabledReason,
    loading: contextLoading,
    buildExperienceFromId: (id) => buildExperienceFromId(id, history),
    submitContext: (contextIds: Uint8Array[]) => {
      if (token == null) return;
      if (queryEmbedded == null) return;
      setContextLoading(true);
      (async () => {
        const prompt = [
          ...contextIds
            .map((x) => [
              `# Query\n\n${history.get_query(x)}`,
              `# Response\n\n${history.get_response(x)}`,
            ])
            .flat(),
          `# Query\n\n${queryEmbedded.text}`,
          "# Response\n\n",
        ].join("\n\n");
        console.info("Prompt:\n\n%s", prompt);
        const response = (await Ait.gpt_generate(token, prompt)).trim();
        setResponse(response);
      })()
        .catch((x) => {
          console.error(x);
          setErrorMessage("Unable generate response.");
        })
        .finally(() => setContextLoading(false));
    },
  };

  let responseDisabledReason = undefined;
  if (response == null) responseDisabledReason = "Response not generated.";

  const editResponseProps: EditResponseProps = {
    response,
    setResponse,
    disabledReason: responseDisabledReason,
    store: () => {
      if (!queryEmbedded || !response) return;
      history.push(queryEmbedded.text, response, queryEmbedded.embedding);
      setQueryEmbedded(undefined);
      setContextIds(undefined);
      setResponse(undefined);
    },
  };

  const settingsProps: SettingsProps = {
    token,
    setToken: (token: string) => {
      if (!token) {
        setToken(undefined);
        window.localStorage.removeItem("token");
      } else {
        setToken(token);
        window.localStorage.setItem("token", token);
      }
    },
    clearHistory: () => {
      window.localStorage.removeItem("history");
      setHistory(Ait.History.load());
    },
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Container maxWidth="md">
            <Typography variant="h6" sx={{ my: 2 }}>
              AIT
            </Typography>
          </Container>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => {
          setErrorMessage(undefined);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => {
            setErrorMessage(undefined);
          }}
          severity="error"
          sx={{ boxShadow: 2 }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      <Container maxWidth="md">
        <>
          <h2>Query</h2>
          <WriteQuery {...writeQueryProps} />
          <h2>Context</h2>
          <EditContext {...editContextProps} />
          <h2>Response</h2>
          <EditResponse {...editResponseProps} />
          <h2>Settings</h2>
          <Settings {...settingsProps} />
        </>
      </Container>
    </>
  );
}
