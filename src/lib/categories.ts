import { getCollection } from 'astro:content';

/** 从所有已发布文章中聚合出分类列表。每项为 URL 用的 slug（如 'life' 或 'note/front-end'）及显示名（最后一段） */
export async function getAllCategories(): Promise<{ slug: string; label: string }[]> {
	const posts = await getCollection('blog', ({ data }) => data.draft !== true);
	const slugSet = new Set<string>();
	for (const post of posts) {
		const cats = post.data.categories ?? [];
		if (cats.length === 0) continue;
		const slug = cats.join('/');
		slugSet.add(slug);
	}
	return Array.from(slugSet)
		.sort()
		.map((slug) => ({ slug, label: slug.split('/').pop() ?? slug }));
}
