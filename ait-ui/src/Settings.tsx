import TextField from "@mui/material/TextField";
import { Button, IconButton, InputAdornment } from "@mui/material";
import React, { useEffect, useState } from "react";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";

export interface SettingsProps {
  token: string | undefined;
  setToken: (token: string) => void;
  clearHistory: () => void;
}

export function Settings(props: SettingsProps) {
  function useToken(
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent
  ) {
    e.preventDefault();
    props.setToken(token);
  }

  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (props.token == null) return;
    setToken(props.token);
  }, [props.token]);

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
      <Button
        variant="contained"
        sx={{ my: 2 }}
        onClick={(e) => {
          e.preventDefault();
          props.clearHistory();
        }}
      >
        Clear History
      </Button>
    </>
  );
}
