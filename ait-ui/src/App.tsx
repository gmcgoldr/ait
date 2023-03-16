import { useEffect, useState } from "react";
import { WriteQuery } from "./WriteQuery";
import { EditContext } from "./EditContext";
import { EditResponse } from "./EditResponse";
import {
  Alert,
  AppBar,
  Box,
  Container,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import { Experiences } from "./Experiences";
import { Embedded } from "./utils";
import { Settings } from "./Settings";
import defaultHistory from "./defaultHistory.json";
import * as Ait from "ait-lib";

function bootstrapHistory(): Ait.History {
  // if (!window.localStorage.getItem("history"))
  //   window.localStorage.setItem("history", defaultHistory);
  return Ait.History.load();
}

export interface AppProps {}

export function App(props: AppProps) {
  let [history, setHistory] = useState<Ait.History>(bootstrapHistory());
  let [experiences, setExperiences] = useState<[Uint8Array, string, string][]>(
    []
  );
  let [query, setQuery] = useState<Embedded>();
  let [context, setContext] = useState<string>();
  let [response, setResponse] = useState<string>();
  let [token, setToken] = useState<string>();
  let [processingQuery, setProcessingQuery] = useState<boolean>(false);
  let [processingContext, setProcessingContext] = useState<boolean>(false);
  let [processingResponse, setProcessingResponse] = useState<boolean>(false);
  let [errorMessage, setErrorMessage] = useState<string | undefined>();

  function updateMessages() {
    setExperiences(
      history
        .get_last_ids(2)
        .map((x) => [x, history.get_query(x), history.get_response(x)])
    );
  }

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
    updateMessages();
  }, [history]);

  function submitQuery(query: string) {
    setProcessingQuery(true);
    (async () => {
      if (token == null) throw Error("tried to submit without a token");
      query = query.trim();
      const embedding = await Ait.gpt_embed(token, query);
      const context = history
        .related_ids(embedding, 3)
        .map((x) => [
          `# Query\n\n${history.get_query(x)}`,
          `# Response\n\n${history.get_response(x)}`,
        ])
        .flat()
        .join("\n\n");
      setQuery({ text: query, embedding });
      setContext(context);
    })()
      .catch((x) => {
        console.error(x);
        setErrorMessage("Failed to process query.");
      })
      .finally(() => {
        setProcessingQuery(false);
      });
  }

  function submitContext(query: Embedded, context: string) {
    setProcessingContext(true);
    (async () => {
      if (token == null) throw Error("tried to submit without a token");
      const prompt = Ait.build_prompt(query.text, context);
      const response = (await Ait.gpt_generate(token, prompt)).trim();
      setResponse(response);
    })()
      .catch((x) => {
        console.error(x);
        setErrorMessage("Failed to process context.");
      })
      .finally(() => {
        setProcessingContext(false);
      });
  }

  function submitResponse(query: Embedded, context: string, response: string) {
    setProcessingResponse(true);
    (async () => {
      await history.push(query.text, response, query.embedding);
      updateMessages();
      setResponse(undefined);
      setContext(undefined);
      setQuery(undefined);
    })()
      .catch((x) => {
        setErrorMessage("Failed to process response.");
        console.error(x);
      })
      .finally(() => {
        setProcessingResponse(false);
      });
  }

  function resetHistory() {
    window.localStorage.removeItem("history");
    setHistory(bootstrapHistory());
  }

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
          <h2>Queries</h2>
          <Experiences
            experiences={experiences}
            removeExperience={(textId: Uint8Array) => {
              history.remove(textId);
              updateMessages();
            }}
          />
          {query == null ? (
            <Box sx={{ my: 2 }}>
              <WriteQuery
                submitQuery={submitQuery}
                loading={processingQuery}
                disabledReason={
                  token == null ? "No API token has been provided." : undefined
                }
              />
            </Box>
          ) : null}
          {query != null &&
          context != null &&
          response == null &&
          token != null ? (
            <EditContext
              query={query}
              context={context}
              submitContext={submitContext}
              loading={processingContext}
              disabledReason={
                token == null ? "No API token has been provided." : undefined
              }
            />
          ) : null}
          {query != null && context != null && response != null ? (
            <EditResponse
              query={query}
              context={context}
              response={response}
              submitResponse={submitResponse}
              loading={processingResponse}
            />
          ) : null}
          <h2>Settings</h2>
          <Settings setToken={setToken} resetHistory={resetHistory} />
        </>
      </Container>
    </>
  );
}
