import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { Button, FormGroup } from "@mui/material";
import { useState } from "react";
import { Embedded, SetState } from "./utils";
import Grid from "@mui/material/Unstable_Grid2";

export interface SettingsProps {
  setToken: SetState<string | undefined>;
  clearHistory: () => void;
}

export function Settings(props: SettingsProps) {
  function useToken(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!token) return;
    props.setToken(token);
  }

  function clearHistory(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    props.clearHistory();
  }

  const [token, setToken] = useState<string | undefined>();

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
      <Button variant="contained" sx={{ my: 2 }} onClick={clearHistory}>
        Clear History
      </Button>
    </>
  );
}
