import TextField from "@mui/material/TextField";
import { useState } from "react";
import { Embedded } from "./utils";
import { LoadingButton } from "@mui/lab";
import { Alert, Box } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

export interface EditContextProps {
  query: Embedded;
  context: string;
  loading?: boolean;
  disabledReason?: string;
  submitContext: (query: Embedded, context: string) => void;
}

export function EditContext(props: EditContextProps) {
  function send(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    props.submitContext(props.query, context);
  }

  const [context, setContext] = useState<string>(props.context);

  return (
    <Box sx={{ my: 4 }}>
      <TextField
        label="Context"
        value={context}
        fullWidth
        multiline
        onChange={(e) => setContext(e.target.value)}
      />
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs="auto" display="flex" alignItems="center">
          <LoadingButton
            variant="contained"
            onClick={send}
            disabled={!!props.disabledReason}
            loading={props.loading}
          >
            Generate response
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
    </Box>
  );
}
