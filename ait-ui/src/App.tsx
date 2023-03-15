import { useEffect, useState } from "react";
import { WriteQuery } from "./WriteQuery";
import { EditContext } from "./EditContext";
import { EditResponse } from "./EditResponse";
import { Container } from "@mui/material";
import { MessageHistory } from "./MessageHistory";
import { Embedded } from "./utils";
import { Settings } from "./Settings";
import defaultHistory from "./defaultHistory.json";
import * as Ait from "ait-lib";

function bootstrapHistory(): Ait.History {
  if (!window.localStorage.getItem("history"))
    window.localStorage.setItem("history", defaultHistory);
  return Ait.History.load();
}

export interface AppProps {}

export function App(props: AppProps) {
  let [history, setHistory] = useState<Ait.History>(bootstrapHistory());
  let [messages, setMessages] = useState<[string, string][]>([]);
  let [query, setQuery] = useState<Embedded>();
  let [context, setContext] = useState<string>();
  let [response, setResponse] = useState<string>();
  let [token, setToken] = useState<string>();

  function onExit() {
    if (document.visibilityState === "hidden") {
      (async () => {
        history.store();
      })().catch((x) => console.error(x));
    }
  }

  useEffect(() => {
    setMessages(history.get_last_messages(4));
    addEventListener("visibilitychange", onExit);
    return function cleanup() {
      removeEventListener("visibilitychange", onExit);
    };
  }, []);

  useEffect(() => {
    setMessages(history.get_last_messages(4));
  }, [history]);

  function submitQuery(query: string) {
    (async () => {
      if (token == null) throw Error("tried to submit without a token");
      query = query.trim();
      const embedding = await Ait.gpt_embed(token, query);
      const context = history.related_experiences(embedding, 3);
      setQuery({ text: query, embedding });
      setContext(context);
    })().catch((x) => console.error(x));
  }

  function submitContext(query: Embedded, context: string) {
    (async () => {
      if (token == null) throw Error("tried to submit without a token");
      const prompt = Ait.build_prompt(query.text, context);
      const response = (await Ait.gpt_generate(token, prompt)).trim();
      setResponse(response);
    })().catch((x) => console.error(x));
  }

  function submitResponse(query: Embedded, context: string, response: string) {
    (async () => {
      await history.add_experience(query.text, response, query.embedding);
      setMessages(history.get_last_messages(4));
      setResponse(undefined);
      setContext(undefined);
      setQuery(undefined);
    })().catch((x) => console.error(x));
  }

  function resetHistory() {
    window.localStorage.removeItem("history");
    setHistory(bootstrapHistory());
  }

  return (
    <Container maxWidth="md">
      <>
        <h1>Ait</h1>
        <MessageHistory messages={messages} />
        {query == null ? (
          <WriteQuery submitQuery={submitQuery} disabled={token == null} />
        ) : null}
        {query != null && context != null && response == null ? (
          <EditContext
            query={query}
            context={context}
            submitContext={submitContext}
          />
        ) : null}
        {query != null && context != null && response != null ? (
          <EditResponse
            query={query}
            context={context}
            response={response}
            submitResponse={submitResponse}
          />
        ) : null}
        <h2>Settings</h2>
        <Settings setToken={setToken} resetHistory={resetHistory} />
      </>
    </Container>
  );
}
