import { Alert, Snackbar } from "@mui/material";

export interface AppAlertProps {
  errorMessage: string | undefined;
  setErrorMessage(errorMessage: string | undefined): void;
}

export function AppAlert(props: AppAlertProps) {
  return (
    <Snackbar
      open={!!props.errorMessage}
      autoHideDuration={6000}
      onClose={() => {
        props.setErrorMessage(undefined);
      }}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={() => {
          props.setErrorMessage(undefined);
        }}
        severity="error"
        sx={{ boxShadow: 2 }}
      >
        {props.errorMessage}
      </Alert>
    </Snackbar>
  );
}
