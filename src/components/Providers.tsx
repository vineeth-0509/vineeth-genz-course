"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
const queryClient = new QueryClient();
export function Provider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    //the reason why we need the query-client-provider for entire application because react-query love does caching
    //image we are on page of the application and  we fetch the same endpoint of the data, and we go to other page and send the same fetch,so here
    //react-query actually cache the endpoints of the pages that we are hitting.it saves time and bandwidth.
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        {...props}
      >
        <SessionProvider>
               {children}
        </SessionProvider>
     
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
