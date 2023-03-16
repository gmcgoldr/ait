import ReactMarkdown from "react-markdown";
import { Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { theme as baseTheme } from "./theme";
import { useState } from "react";

// offset heading sizes to better fit inside a surrounding document
const markdownTheme = createTheme({
  typography: {
    h1: {
      fontSize: baseTheme.typography.h2.fontSize,
    },
    h2: {
      fontSize: baseTheme.typography.h3.fontSize,
    },
    h3: {
      fontSize: baseTheme.typography.h4.fontSize,
    },
    h4: {
      fontSize: baseTheme.typography.h6.fontSize,
    },
    h5: {
      fontSize: baseTheme.typography.h6.fontSize,
    },
  },
});

export interface MarkdownBoxProps {
  markdown: string;
}

export function MarkdownBox(props: MarkdownBoxProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <ThemeProvider theme={markdownTheme}>
      <Box
        sx={{
          alignSelf: "center",
          "& :first-child": {
            marginTop: "0!important",
          },
          "& :last-child": {
            marginBottom: "0!important",
          },
        }}
      >
        <ReactMarkdown>{props.markdown}</ReactMarkdown>
      </Box>
    </ThemeProvider>
  );
}
