import { getCollection } from 'astro:content';

/** 从所有已发布文章中聚合出标签列表（去重、按字母序） */
export async function getAllTags(): Promise<string[]> {
	const posts = await getCollection('blog', ({ data }) => data.draft !== true);
	const set = new Set<string>();
	for (const post of posts) {
		for (const tag of post.data.tags ?? []) set.add(tag);
	}
	return Array.from(set).sort();
}
