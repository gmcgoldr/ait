import { useState } from "react";
import { WriteQuery } from "./WriteQuery";
import { EditContext } from "./EditContext";
import { EditResponse } from "./EditResponse";
import { Container } from "@mui/material";
import { MessageHistory } from "./MessageHistory";
import { Embedded } from "./utils";
import * as Ait from "ait-lib";
import { Settings } from "./Settings";

export interface AppProps {
  history: Ait.History | undefined;
}

export function App(props: AppProps) {
  let [messages, setMessages] = useState<string[]>([]);
  let [query, setQuery] = useState<Embedded>();
  let [context, setContext] = useState<string>();
  let [response, setResponse] = useState<string>();
  let [token, setToken] = useState<string>();

  if (props.history == null) return null;
  const history = props.history;

  function submitQuery(query: string) {
    (async () => {
      if (token == null) throw Error("tried to submit without a token");
      query = query.trim();
      const embedding = await Ait.gpt_embed(token, query);
      const context = history.related_experiences(embedding, 4);
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
      history.add_experience(query.text, response, query.embedding);
      setMessages((messages) => [...messages, query.text, response]);
      setResponse(undefined);
      setContext(undefined);
      setQuery(undefined);
    })().catch((x) => console.error(x));
  }

  function clearHistory() {
    history.clear();
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
        <Settings setToken={setToken} clearHistory={clearHistory} />
      </>
    </Container>
  );
}
