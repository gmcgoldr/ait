import TextField from "@mui/material/TextField";
import { Button, IconButton, InputAdornment } from "@mui/material";
import React, { useState } from "react";
import { SetState } from "./utils";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import Grid from "@mui/material/Unstable_Grid2";

export interface SettingsProps {
  setToken: SetState<string | undefined>;
  resetHistory: () => void;
}

export function Settings(props: SettingsProps) {
  function useToken(
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent
  ) {
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
      <TextField
        label="OpenAI API token"
        value={token}
        fullWidth
        onChange={(e) => setToken(e.target.value)}
        onKeyDown={(e) => {
          if (e.key != "Enter") return;
          useToken(e);
        }}
        InputProps={{
          sx: { fontFamily: "monospace", color: "text.secondary" },
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={useToken}
                edge="end"
              >
                <KeyboardReturnIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button variant="contained" sx={{ my: 2 }} onClick={resetHistory}>
        Reset History
      </Button>
    </>
  );
}
