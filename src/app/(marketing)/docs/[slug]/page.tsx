import { promises as fs } from "fs";
import path from "path";
import { marked } from "marked";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { DocsLayout } from "../_components/DocsLayout";
import { SchemaVisualizer } from "../_components/SchemaVisualizer";

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
	let htmlContent = "";

	try {
		const content = await fs.readFile(filePath, "utf8");
		const rawHtml = await marked.parse(content);
		// Wrap tables in a scrollable container for responsiveness
		htmlContent = rawHtml
			.replace(/<table>/g, '<div class="docs-table-wrapper"><table>')
			.replace(/<\/table>/g, "</table></div>");
	} catch (error) {
		console.error(`Error reading doc file: ${filePath}`, error);
		return notFound();
	}

	const displayTitle = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

	// Architecture page special rendering for the schema
	const isArchitecture = slug.toLowerCase() === "architecture";
	const mermaidBlock = /<pre><code class="language-mermaid">[\s\S]*?<\/code><\/pre>/;
	const [beforeSchema, afterSchema] = isArchitecture
		? htmlContent.split(mermaidBlock)
		: [htmlContent, null];

	return (
		<DocsLayout title={displayTitle} navigation={navigation}>
			<article
				className="zlot-docs-article relative flex flex-col
					[&_h1]:hidden
					[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-16 [&_h2]:mb-8 [&_h2]:text-text-primary [&_h2]:border-b [&_h2]:border-border/20 [&_h2]:pb-4 [&_h2]:leading-tight
					[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-12 [&_h3]:mb-6 [&_h3]:text-text-primary [&_h3]:leading-snug
					[&_p]:text-text-secondary/90 [&_p]:leading-relaxed [&_p]:mb-8 [&_p]:text-lg
					[&_ul]:list-none [&_ul]:pl-0 [&_ul]:mb-6 [&_ul]:space-y-4
					[&_ul>li]:relative [&_ul>li]:pl-7 [&_ul>li]:text-text-secondary/90 [&_ul>li]:before:content-[''] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.6em] [&_ul>li]:before:w-1.5 [&_ul>li]:before:h-1.5 [&_ul>li]:before:bg-primary/40 [&_ul>li]:before:rounded-full
					[&_ul_ul]:mt-4 [&_ul_ul]:mb-0 [&_ul_ul]:pl-6 [&_ul_ul]:space-y-3
					[&_ul_ul>li]:before:bg-secondary/30 [&_ul_ul>li]:before:rounded-sm [&_ul_ul>li]:text-text-secondary/70 [&_ul_ul>li]:text-base
					[&_ol]:list-none [&_ol]:pl-0 [&_ol]:mb-8 [&_ol]:space-y-6 [&_ol]:counter-reset-list
					[&_ol>li]:relative [&_ol>li]:pl-10 [&_ol>li]:text-text-secondary/90 [&_ol>li]:counter-increment-list [&_ol>li]:before:content-[counter(list)] [&_ol>li]:before:absolute [&_ol>li]:before:left-0 [&_ol>li]:before:top-0 [&_ol>li]:before:w-7 [&_ol>li]:before:h-7 [&_ol>li]:before:bg-primary/10 [&_ol>li]:before:border [&_ol>li]:before:border-primary/20 [&_ol>li]:before:rounded-lg [&_ol>li]:before:flex [&_ol>li]:before:items-center [&_ol>li]:before:justify-center [&_ol>li]:before:text-[10px] [&_ol>li]:before:font-mono [&_ol>li]:before:font-black [&_ol>li]:before:text-primary
					[&_pre]:bg-surface/50 [&_pre]:border [&_pre]:border-border/40 [&_pre]:rounded-2xl [&_pre]:p-8 [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:shadow-sm [&_pre]:backdrop-blur-sm
					[&_code]:text-primary [&_code]:bg-primary/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.9em] [&_code]:font-mono
					[&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_pre>code]:text-text-primary/90 [&_pre>code]:text-[0.95em] [&_pre>code]:leading-relaxed
					
					/* Table UI Refactoring */
					[&_.docs-table-wrapper]:w-full [&_.docs-table-wrapper]:overflow-x-auto [&_.docs-table-wrapper]:my-12 [&_.docs-table-wrapper]:rounded-2xl [&_.docs-table-wrapper]:border [&_.docs-table-wrapper]:border-border/40 [&_.docs-table-wrapper]:bg-surface/30 [&_.docs-table-wrapper]:shadow-xl [&_.docs-table-wrapper]:scrollbar-hide
					[&_table]:w-full [&_table]:min-w-[600px] [&_table]:border-collapse [&_table]:text-sm
					[&_table_th]:px-6 [&_table_th]:py-5 [&_table_th]:text-left [&_table_th]:font-mono [&_table_th]:text-[10px] [&_table_th]:font-black [&_table_th]:text-primary [&_table_th]:bg-white/5 [&_table_th]:uppercase [&_table_th]:tracking-[0.2em] [&_table_th]:border-b [&_table_th]:border-border/40
					[&_table_td]:px-6 [&_table_td]:py-4 [&_table_td]:text-text-secondary/80 [&_table_td]:border-b [&_table_td]:border-border/10 [&_table_tr:last-child_td]:border-0
					[&_table_tr]:transition-colors [&_table_tr]:hover:bg-white/2
					[&_table_td_strong]:text-text-primary [&_table_td_strong]:font-bold
					
					[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-8 [&_blockquote]:py-6 [&_blockquote]:italic [&_blockquote]:text-text-secondary/70 [&_blockquote]:my-12 [&_blockquote]:bg-surface/20 [&_blockquote]:rounded-r-2xl
					[&_hr]:border-border/20 [&_hr]:my-20"
			>
				{/* Before Schema Block */}
				<div className="flex flex-col" dangerouslySetInnerHTML={{ __html: beforeSchema }} />

				{/* Visualizer Injection */}
				{isArchitecture && (
					<div className="w-full my-12">
						<SchemaVisualizer />
					</div>
				)}

				{/* After Schema Block */}
				{afterSchema && (
					<div className="flex flex-col" dangerouslySetInnerHTML={{ __html: afterSchema }} />
				)}
			</article>
		</DocsLayout>
	);
};

export default DocsPage;
