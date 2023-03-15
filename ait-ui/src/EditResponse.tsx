import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import { useState } from "react";
import { Embedded } from "./utils";

export interface EditResponseProps {
  query: Embedded;
  context: string;
  response: string;
  submitResponse: (query: Embedded, context: string, response: string) => void;
}

export function EditResponse(props: EditResponseProps) {
  function send(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    props.submitResponse(props.query, props.context, response);
  }

  const [response, setResponse] = useState<string>(props.response);

  return (
    <Box sx={{ my: 4 }}>
      <TextField
        label="Response"
        value={response}
        fullWidth
        multiline
        rows={4}
        onChange={(e) => setResponse(e.target.value)}
      />
      <Button variant="contained" sx={{ mt: 1 }} onClick={send}>
        Submit
      </Button>
    </Box>
  );
}
