import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import { useState } from "react";

export interface WriteQueryProps {
  disabled: boolean;
  submitQuery: (message: string) => void;
}

export function WriteQuery(props: WriteQueryProps) {
  function send(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (query) props.submitQuery(query);
  }

  const [query, setQuery] = useState<string>("");

  return (
    <Box sx={{ my: 4 }}>
      <TextField
        label="Query"
        fullWidth
        multiline
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button
        variant="contained"
        sx={{ mt: 1 }}
        onClick={send}
        disabled={props.disabled}
      >
        Submit
      </Button>
    </Box>
  );
}
