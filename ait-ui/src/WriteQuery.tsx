import TextField from "@mui/material/TextField";
import { useEffect, useRef, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Alert } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

import { Experience } from "./Experiences";

export interface WriteQueryProps {
  query: string | undefined;
  disabledReason?: string;
  loading?: boolean;
  buildExperienceFromId: (id: Uint8Array) => Experience;
  submit: (query: string) => void;
  clearQuery: () => void;
}

export function WriteQuery(props: WriteQueryProps) {
  let inputRef = useRef<HTMLInputElement>();
  const query = props.query == null ? "" : props.query;

  useEffect(() => {
    if (inputRef.current == null) return;
    inputRef.current.value = query;
  }, []);

  useEffect(() => {
    if (inputRef.current == null) return;
    inputRef.current.value = query;
  }, [props.query]);

  return (
    <>
      <TextField
        label="Query"
        fullWidth
        multiline
        inputRef={inputRef}
        sx={{ mb: 1 }}
      />
      <Grid container spacing={1}>
        <Grid xs="auto" display="flex" alignItems="center">
          <LoadingButton
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              if (inputRef.current == null) return;
              props.submit(inputRef.current.value);
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
