import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getPublishedPosts } from '../lib/posts';

export async function GET(context) {
	const posts = await getPublishedPosts();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		// 不能直接展开 post.data，因为其中的 cover/heroImage 是 ImageMetadata 对象，
		// 序列化为 RSS XML 时会出问题，这里只挑选需要的标量字段。
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			updatedDate: post.data.updatedDate,
			link: `/blog/${post.id}/`,
		})),
	});
}
