import React from "react";
import * as Ait from "ait-lib";

import { Experience } from "./Experiences";

export interface Embedded {
  text: string;
  embedding: Uint8Array;
}

export function buildExperienceFromId(
  id: Uint8Array,
  history: Ait.History
): Experience {
  const query = history.get_query(id);
  const response = history.get_response(id);
  return {
    id,
    query,
    response,
  };
}
