export default function LoadingSpinner() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
				<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
					Loading...
				</p>
			</div>
		</div>
	);
}
