import React from "react";

export interface Embedded {
  text: string;
  embedding: Uint8Array;
}

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
