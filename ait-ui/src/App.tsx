import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import * as Ait from "ait-lib";

import { SettingsProps } from "./Settings";
import { WriteQueryProps } from "./WriteQuery";
import { EditContextProps } from "./EditContext";
import { EditResponseProps } from "./EditResponse";
import { buildExperienceFromId, Embedded, Message } from "./utils";
import { AppAlertProps } from "./AppAlert";
import { Query, QueryProps } from "./Query";

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

  const appAlertProps: AppAlertProps = {
    errorMessage,
    setErrorMessage,
  };

  const writeQueryProps: WriteQueryProps = {
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
  else if (contextIds == null) contextDisabledReason = "Context not built.";

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
        const messages: Message[] = [
          ...contextIds.map((x) => ({
            query: history.get_query(x),
            response: history.get_response(x),
          })),
          { query: queryEmbedded.text, response: "" },
        ];
        console.info("Messages:\n\n%O", messages);
        const response = (await Ait.chat_complete(token, messages)).trim();
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

  const queryProps: QueryProps = {
    appAlertProps,
    writeQueryProps,
    editContextProps,
    editResponseProps,
    settingsProps,
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Query {...queryProps} />,
    },
  ]);

  return <RouterProvider router={router} />;
}
