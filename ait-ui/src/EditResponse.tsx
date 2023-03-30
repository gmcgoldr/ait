import TextField from "@mui/material/TextField";
import { LoadingButton } from "@mui/lab";
import { Alert } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useRef } from "react";

export interface EditResponseProps {
  response: string | undefined;
  disabledReason?: string;
  loading?: boolean;
  store: (response: string) => void;
}

export function EditResponse(props: EditResponseProps) {
  let inputRef = useRef<HTMLInputElement>();
  const response = props.response == null ? "" : props.response;

  useEffect(() => {
    if (inputRef.current == null) return;
    inputRef.current.value = response;
  }, []);

  useEffect(() => {
    if (inputRef.current == null) return;
    inputRef.current.value = response;
  }, [props.response]);

  return (
    <>
      {props.response != null ? (
        <TextField
          label="Response"
          inputRef={inputRef}
          fullWidth
          multiline
          sx={{ mb: 1 }}
        />
      ) : null}
      <Grid container spacing={2}>
        <Grid xs="auto" display="flex" alignItems="center">
          <LoadingButton
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              if (inputRef.current == null) return;
              props.store(inputRef.current.value);
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
