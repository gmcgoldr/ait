import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { Alert, LoadingButton } from "@mui/lab";
import Grid from "@mui/material/Unstable_Grid2";

export interface EditResponseProps {
  response: string | undefined;
  setResponse: (x: string) => void;
  disabledReason?: string;
  loading?: boolean;
  store: () => void;
}

export function EditResponse(props: EditResponseProps) {
  return (
    <>
      {props.response != null ? (
        <TextField
          label="Response"
          value={props.response ? props.response : ""}
          fullWidth
          multiline
          onChange={(e) => props.setResponse(e.target.value)}
          sx={{ mb: 1 }}
        />
      ) : null}
      <Grid container spacing={2}>
        <Grid xs="auto" display="flex" alignItems="center">
          <LoadingButton
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              props.store();
            }}
            loading={props.loading}
            disabled={!!props.disabledReason}
          >
            Store experience
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
