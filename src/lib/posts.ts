import { getCollection } from 'astro:content';

/** 获取已发布的博客文章（排除草稿），按发布日期倒序 */
export async function getPublishedPosts() {
	const posts = await getCollection('blog', ({ data }) => data.draft !== true);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 按分类筛选文章。slug 格式为 'life' 或 'note/front-end'（与 frontmatter categories 数组 join 一致） */
export async function getPostsByCategory(slug: string) {
	const posts = await getPublishedPosts();
	const slugParts = slug.split('/');
	return posts.filter((post) => {
		const cats = post.data.categories ?? [];
		if (cats.length !== slugParts.length) return false;
		return slugParts.every((part, i) => cats[i] === part);
	});
}

/** 按标签筛选文章 */
export async function getPostsByTag(tag: string) {
	const posts = await getPublishedPosts();
	return posts.filter((post) => (post.data.tags ?? []).includes(tag));
}
