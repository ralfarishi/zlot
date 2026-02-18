"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				retry: 1,
				refetchOnWindowFocus: false,
			},
		},
	});

export const QueryProvider = ({ children }: { children: ReactNode }) => {
	const [queryClient] = useState(createQueryClient);
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
