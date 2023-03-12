import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Embedded } from "./utils";

export interface EditContextProps {
  query: Embedded;
  context: string;
  submitContext: (query: Embedded, context: string) => void;
}

export function EditContext(props: EditContextProps) {
  function send(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    props.submitContext(props.query, context ?? props.context);
  }

  const [context, setContext] = useState<string | undefined>();

  return (
    <Box sx={{ my: 4 }}>
      <TextField
        label="Context"
        defaultValue={props.context}
        value={context}
        fullWidth
        multiline
        rows={4}
        onChange={(e) => setContext(e.target.value)}
      />
      <Button variant="contained" sx={{ mt: 1 }} onClick={send}>
        Submit
      </Button>
    </Box>
  );
}
