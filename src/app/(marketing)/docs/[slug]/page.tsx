import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { DocsLayout } from "../_components/DocsLayout";
import { DocsArticle } from "../_components/DocsArticle";

interface Props {
	params: Promise<{
		slug: string;
	}>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const title = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
	return {
		title: `${title} | Zlot Documentation`,
	};
}

const DocsPage = async ({ params }: Props) => {
	const { slug } = await params;
	const docsDir = path.join(process.cwd(), "docs");

	// Fetch all documentation files for navigation
	let navigation: { title: string; slug: string }[] = [];
	try {
		const files = await fs.readdir(docsDir);
		navigation = files
			.filter((f) => f.endsWith(".md"))
			.map((f) => {
				const s = f.replace(".md", "");
				return {
					title: s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "),
					slug: s,
				};
			});
	} catch (error) {
		console.error("Error reading docs directory for navigation", error);
	}

	// Case-insensitive file matching
	let matchedFile: string | undefined;
	try {
		const files = await fs.readdir(docsDir);
		matchedFile = files.find((f) => f.toLowerCase() === `${slug.toLowerCase()}.md`);
	} catch {
		return notFound();
	}

	if (!matchedFile) {
		return notFound();
	}

	const filePath = path.join(docsDir, matchedFile);
	let markdownContent = "";

	try {
		markdownContent = await fs.readFile(filePath, "utf8");
	} catch (error) {
		console.error(`Error reading doc file: ${filePath}`, error);
		return notFound();
	}

	const displayTitle = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
	const isArchitecture = slug.toLowerCase() === "architecture";

	return (
		<DocsLayout title={displayTitle} navigation={navigation}>
			<DocsArticle content={markdownContent} isArchitecture={isArchitecture} />
		</DocsLayout>
	);
};

export default DocsPage;
