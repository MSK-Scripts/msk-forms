"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface ErrorCopy {
  kicker: string;
  title: string;
  text: string;
  retry: string;
  home: string;
}

const FALLBACK: ErrorCopy = {
  kicker: "Something went wrong",
  title: "This page could not be loaded",
  text: "Please try again in a moment.",
  retry: "Try again",
  home: "Go to the home page",
};

const Context = createContext<ErrorCopy>(FALLBACK);

/**
 * The copy of the error page. app/error.tsx has to be a client component and
 * cannot read the dictionary on the server, and importing the dictionary
 * into the browser would ship all seven languages with every page. So the
 * root layout, which wraps the error boundary, hands the few strings down.
 */
export function ErrorCopyProvider({ copy, children }: { copy: ErrorCopy; children: ReactNode }) {
  return <Context.Provider value={copy}>{children}</Context.Provider>;
}

export function useErrorCopy(): ErrorCopy {
  return useContext(Context);
}
