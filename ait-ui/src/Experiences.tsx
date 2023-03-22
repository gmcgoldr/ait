import Avatar from "@mui/material/Avatar";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import PersonIcon from "@mui/icons-material/Person";
import { Box, Divider } from "@mui/material";
import { MarkdownBox } from "./MarkdownBox";
import React from "react";

export interface Experience {
  id: Uint8Array;
  query: string;
  response: string;
}

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
          <DeveloperBoardIcon />
        </Avatar>
        <Box sx={{ my: 1 }}>
          <MarkdownBox markdown={props.response} />
        </Box>
      </Box>
    </Box>
  );
}

export interface ExperienceAndTitle {
  experience: Experience;
  title: React.ReactNode;
}

export interface ExperiencesProps {
  experiencesTitles: ExperienceAndTitle[];
}

export function Experiences(props: ExperiencesProps) {
  return (
    <>
      {props.experiencesTitles.map(({ experience, title }, index) => (
        <ExperienceItem
          key={index}
          query={experience.query}
          response={experience.response}
          title={title}
        />
      ))}
    </>
  );
}
