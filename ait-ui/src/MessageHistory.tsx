export interface ComposeMessageProps {
  messages: string[];
}

export function MessageHistory(props: ComposeMessageProps) {
  return (
    <ul>
      {props.messages.map((message, idx) => (
        <li key={idx}>{message}</li>
      ))}
    </ul>
  );
}
