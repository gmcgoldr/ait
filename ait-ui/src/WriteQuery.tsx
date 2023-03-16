import TextField from "@mui/material/TextField";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Alert } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

export interface WriteQueryProps {
  loading?: boolean;
  disabledReason?: string;
  submitQuery: (message: string) => void;
}

export function WriteQuery(props: WriteQueryProps) {
  function send(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (query) props.submitQuery(query);
  }

  const [query, setQuery] = useState<string>("");

  return (
    <>
      <TextField
        label="Query"
        fullWidth
        multiline
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs="auto" display="flex" alignItems="center">
          <LoadingButton
            variant="contained"
            onClick={send}
            disabled={!!props.disabledReason}
            loading={props.loading}
          >
            Build context
          </LoadingButton>
        </Grid>
        {!!props.disabledReason ? (
          <Grid xs display="flex" alignItems="center">
            <Alert severity="warning" sx={{ width: "100%" }}>
              {props.disabledReason}
            </Alert>
          </Grid>
        ) : null}
      </Grid>
    </>
  );
}
