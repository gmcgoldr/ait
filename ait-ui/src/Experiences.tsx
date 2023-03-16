import Avatar from "@mui/material/Avatar";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { Box, Chip, Collapse, Divider } from "@mui/material";
import { MarkdownBox } from "./MarkdownBox";
import React, { ReactHTML, useState } from "react";

interface ExperienceItemProps {
  query: string;
  response: string;
  title?: React.ReactNode;
}

function ExperienceItem(props: ExperienceItemProps) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        my: 2,
        overflow: "hidden",
      }}
    >
      {props.title ? (
        <>
          <Box
            sx={{
              backgroundColor: "grey.100",
              p: 1,
            }}
          >
            {props.title}
          </Box>
          <Divider variant="fullWidth" />
        </>
      ) : null}
      <Box sx={{ display: "flex" }}>
        <Avatar sx={{ m: 1 }}>
          <PersonIcon />
        </Avatar>
        <MarkdownBox markdown={props.query} />
      </Box>
      <Divider variant="fullWidth" />
      <Box sx={{ display: "flex" }}>
        <Avatar sx={{ m: 1 }}>
          <SmartToyIcon />
        </Avatar>
        <MarkdownBox markdown={props.response} />
      </Box>
    </Box>
  );
}

export interface ExperiencesProps {
  experiences: [Uint8Array, string, string][];
  removeExperience: (textId: Uint8Array) => void;
}

export function Experiences(props: ExperiencesProps) {
  return (
    <>
      {props.experiences.map(([textId, query, response], index) => (
        <ExperienceItem
          key={index}
          query={query}
          response={response}
          title={
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Chip
                label="Forget"
                color="secondary"
                variant="outlined"
                size="small"
                onClick={(event: React.MouseEvent) => {
                  event.preventDefault();
                  props.removeExperience(textId);
                }}
              />
            </Box>
          }
        />
      ))}
    </>
  );
}
