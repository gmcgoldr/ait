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
import DEFAULT_HISTORY from "./default_history.json";

export function App() {
  let [history, setHistory] = useState<Ait.History>(Ait.History.load());
  let [query, setQuery] = useState<string>();
  let [contextIds, setContextIds] = useState<Uint8Array[]>();
  let [response, setResponse] = useState<string>();
  let [token, setToken] = useState<string>();
  let [errorMessage, setErrorMessage] = useState<string | undefined>();
  let [queryLoading, setQueryLoading] = useState<boolean>(false);
  let [contextLoading, setContextLoading] = useState<boolean>(false);

  function storeHistory() {
    if (document.visibilityState === "hidden") {
      (async () => {
        history.store();
      })().catch((x) => console.error(x));
    }
  }

  function clearHistory() {
    removeEventListener("visibilitychange", storeHistory);
    window.localStorage.removeItem("ait_history");
    setResponse(undefined);
    setContextIds(undefined);
    setHistory(Ait.History.load());
  }

  function resetHistory() {
    removeEventListener("visibilitychange", storeHistory);
    window.localStorage.setItem("ait_history", DEFAULT_HISTORY);
    setResponse(undefined);
    setContextIds(undefined);
    setHistory(Ait.History.load());
  }

  useEffect(() => {
    addEventListener("visibilitychange", storeHistory);
    return function cleanup() {
      removeEventListener("visibilitychange", storeHistory);
    };
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem("ait_token");
    if (token == null) return;
    setToken(token);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem("ait_history") != null) return;
    resetHistory();
  }, []);

  let queryDisabledReason = undefined;
  if (token == null) queryDisabledReason = "No API token has been provided.";

  const appAlertProps: AppAlertProps = {
    errorMessage,
    setErrorMessage,
  };

  const writeQueryProps: WriteQueryProps = {
    query,
    disabledReason: queryDisabledReason,
    loading: queryLoading,
    buildExperienceFromId: (id) => buildExperienceFromId(id, history),
    submit: (query: string) => {
      if (!token || !query) return;
      setQuery(query);
      setQueryLoading(true);
      (async () => {
        const embedding = await Ait.gpt_embed(token, query);
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
      if (token == null || query == null) return;
      setContextLoading(true);
      (async () => {
        const messages: Message[] = contextIds.map((x) => ({
          query: history.get_query(x),
          response: history.get_response(x),
          rank: history.get_rank(x),
        }));
        messages.sort((a, b) => a.rank - b.rank);
        messages.push({ query, response: "", rank: 0 });
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
  if (token == null) responseDisabledReason = "No API token has been provided.";
  if (response == null) responseDisabledReason = "Response not generated.";

  const editResponseProps: EditResponseProps = {
    response,
    disabledReason: responseDisabledReason,
    store: (response: string) => {
      if (
        token == null ||
        query == null ||
        contextIds == null ||
        response == null
      )
        return;
      setResponse(response);
      (async () => {
        const embedding = await Ait.gpt_embed(token, `${query}\n\n${response}`);
        history.push(query, response, embedding, contextIds);
      })();
      setQuery(undefined);
      setContextIds(undefined);
      setResponse(undefined);
    },
  };

  const settingsProps: SettingsProps = {
    token,
    setToken: (token: string) => {
      if (!token) {
        setToken(undefined);
        window.localStorage.removeItem("ait_token");
      } else {
        setToken(token);
        window.localStorage.setItem("ait_token", token);
      }
    },
    clearHistory,
    resetHistory,
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
      path: "/ait/",
      element: <Query {...queryProps} />,
    },
  ]);

  return <RouterProvider router={router} />;
}
