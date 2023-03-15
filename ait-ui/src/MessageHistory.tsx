import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { Divider } from "@mui/material";

interface MessageItemProps {
  messageType: MessageType;
  messageValue: string;
}

function MessageItem(props: MessageItemProps) {
  return (
    <>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar>{iconFromType(props.messageType)}</Avatar>
        </ListItemAvatar>
        <ListItemText primary={props.messageValue} />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
}

export interface ComposeMessageProps {
  messages: [string, string][];
}

type MessageType = "query" | "response";

function iconFromType(messageType: MessageType): React.ReactNode {
  if (messageType === "query") {
    return <PersonIcon />;
  } else if (messageType === "response") {
    return <SmartToyIcon />;
  }
}

export function MessageHistory(props: ComposeMessageProps) {
  const history: [MessageType, string][] = [];

  for (const [query, response] of props.messages) {
    if (query) history.push(["query", query]);
    if (response) history.push(["response", response]);
  }

  return (
    <List>
      {history.map(([messageType, messageValue], index) => (
        <MessageItem
          key={index}
          messageType={messageType}
          messageValue={messageValue}
        />
      ))}
    </List>
  );
}
