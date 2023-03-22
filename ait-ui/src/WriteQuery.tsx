import TextField from "@mui/material/TextField";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Alert } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

import { Experience } from "./Experiences";

export interface WriteQueryProps {
  query: string | undefined;
  setQuery: (x: string) => void;
  disabledReason?: string;
  loading?: boolean;
  buildExperienceFromId: (id: Uint8Array) => Experience;
  submit: () => void;
  clearQuery: () => void;
}

export function WriteQuery(props: WriteQueryProps) {
  return (
    <>
      <TextField
        label="Query"
        fullWidth
        multiline
        value={props.query ? props.query : ""}
        onChange={(e) => props.setQuery(e.target.value)}
        sx={{ mb: 1 }}
      />
      <Grid container spacing={2}>
        <Grid xs="auto" display="flex" alignItems="center">
          <LoadingButton
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              props.submit();
            }}
            disabled={!!props.disabledReason}
            loading={props.loading}
          >
            Build context
          </LoadingButton>
        </Grid>
        <Grid xs="auto" display="flex" alignItems="center">
          <LoadingButton
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              props.clearQuery();
            }}
          >
            Restart
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
