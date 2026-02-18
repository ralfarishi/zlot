const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex min-h-dvh items-center justify-center bg-background px-[var(--space-lg)] py-[var(--space-2xl)]">
			<div className="w-full max-w-md">{children}</div>
		</div>
	);
};

export default AuthLayout;
