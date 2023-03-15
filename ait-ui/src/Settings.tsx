import TextField from "@mui/material/TextField";
import { Button, FormGroup } from "@mui/material";
import { useState } from "react";
import { SetState } from "./utils";
import Grid from "@mui/material/Unstable_Grid2";

export interface SettingsProps {
  setToken: SetState<string | undefined>;
  resetHistory: () => void;
}

export function Settings(props: SettingsProps) {
  function useToken(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (token) props.setToken(token);
  }

  function resetHistory(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    props.resetHistory();
  }

  const [token, setToken] = useState<string>("");

  return (
    <>
      <Grid container spacing={2}>
        <Grid xs alignItems={"center"} style={{ display: "flex" }}>
          <TextField
            label="OpenAI Token"
            value={token}
            fullWidth
            onChange={(e) => setToken(e.target.value)}
            inputProps={{
              sx: { fontFamily: "monospace", color: "text.secondary" },
            }}
          />
        </Grid>
        <Grid xs={"auto"} alignItems={"center"} style={{ display: "flex" }}>
          <Button variant="contained" onClick={useToken}>
            Use token
          </Button>
        </Grid>
      </Grid>
      <Button variant="contained" sx={{ my: 2 }} onClick={resetHistory}>
        Reset History
      </Button>
    </>
  );
}
