import { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Alert, Box, Chip } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { Experiences, Experience } from "./Experiences";

export interface ExperienceTitleProps {
  id: Uint8Array;
  dropExperience: (id: Uint8Array) => void;
}

export function ExperienceTitle(props: ExperienceTitleProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <Chip
        label="Drop"
        color="secondary"
        variant="outlined"
        size="small"
        onClick={(event: React.MouseEvent) => {
          event.preventDefault();
          props.dropExperience(props.id);
        }}
      />
    </Box>
  );
}

export interface EditContextProps {
  contextIds: Uint8Array[] | undefined;
  disabledReason?: string;
  loading?: boolean;
  buildExperienceFromId: (id: Uint8Array) => Experience;
  submitContext: (contextIds: Uint8Array[]) => void;
}

export function EditContext(props: EditContextProps) {
  const [removedIds, setRemovedIds] = useState<Set<Uint8Array>>(new Set());
  const [numIds, setNumIds] = useState(3);
  const contextIds = props.contextIds
    ? props.contextIds.slice(0, numIds).filter((x) => !removedIds.has(x))
    : undefined;

  function dropExperience(id: Uint8Array) {
    setRemovedIds((prev) => new Set([...prev, id]));
  }

  useEffect(() => {
    setNumIds(3);
    setRemovedIds(new Set());
  }, [props.contextIds]);

  const experiencesTitles =
    contextIds && contextIds.length > 0
      ? contextIds.map((x) => {
          const experience = props.buildExperienceFromId(x);
          return {
            experience,
            title: (
              <ExperienceTitle
                id={experience.id}
                dropExperience={dropExperience}
              />
            ),
          };
        })
      : undefined;

  const maxNumIds = props.contextIds ? props.contextIds.length : 0;

  return (
    <>
      {experiencesTitles != null ? (
        <Box sx={{ mb: 1 }}>
          <Experiences experiencesTitles={experiencesTitles} />
        </Box>
      ) : null}
      {contextIds ? (
        <Box sx={{ mb: 1, display: "flex", justifyContent: "center" }}>
          <Chip
            label="More context"
            variant="outlined"
            color="primary"
            onClick={(e) => {
              e.preventDefault();
              setNumIds((prev) => prev + 1);
            }}
            disabled={numIds >= maxNumIds}
          />
        </Box>
      ) : null}
      <Grid container spacing={2}>
        <Grid xs="auto" display="flex" alignItems="center">
          <LoadingButton
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              if (contextIds == null) return;
              props.submitContext(contextIds);
            }}
            disabled={!!props.disabledReason}
            loading={props.loading}
          >
            Generate response
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
