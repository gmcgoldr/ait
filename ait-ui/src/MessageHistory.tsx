import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import ReactMarkdown from "react-markdown";
import { Box, Container, Divider } from "@mui/material";

type MessageType = "query" | "response";

function iconFromType(messageType: MessageType): React.ReactNode {
  if (messageType === "query") {
    return <PersonIcon />;
  } else if (messageType === "response") {
    return <SmartToyIcon />;
  }
}

interface MessageItemProps {
  messageType: MessageType;
  messageValue: string;
}

function MessageItem(props: MessageItemProps) {
  return (
    <Box sx={{ display: "flex", borderRadius: 2, boxShadow: 2, my: 2 }}>
      <Avatar sx={{ m: 1 }}>{iconFromType(props.messageType)}</Avatar>
      <Box
        sx={{
          alignSelf: "center",
          "& :first-child": {
            marginTop: "0!important",
          },
          "& :last-child": {
            marginBottom: "0!important",
          },
        }}
      >
        <ReactMarkdown>{props.messageValue}</ReactMarkdown>
      </Box>
    </Box>
  );
}

export interface ComposeMessageProps {
  messages: [string, string][];
}

export function MessageHistory(props: ComposeMessageProps) {
  const history: [MessageType, string][] = [];

  for (const [query, response] of props.messages) {
    if (query) history.push(["query", query]);
    if (response) history.push(["response", response]);
  }

  return (
    <>
      {history.map(([messageType, messageValue], index) => (
        <MessageItem
          key={index}
          messageType={messageType}
          messageValue={messageValue}
        />
      ))}
    </>
  );
}
