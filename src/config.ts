export const SITE = {
	website: "https://www.lrbar.com/", // replace this with your deployed domain
	author: "Mac",
	profile: "https://www.lrbar.com/",
	desc: "Mac的博客 - 技术分享、生活记录、工具开发",
	title: "懒人吧",
	ogImage: "astropaper-og.jpg",
	lightAndDarkMode: true,
	postPerIndex: 4,
	postPerPage: 4,
	scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
	showArchives: true,
	showBackButton: true, // show back button in post detail
	editPost: {
		enabled: true,
		text: "编辑页面",
		url: "https://github.com/37748846/personal-blog/edit/main/",
	},
	dynamicOgImage: true,
	dir: "ltr", // "rtl" | "auto"
	lang: "zh-CN", // html lang code. Set this empty and default will be "en"
	timezone: "Asia/Shanghai", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
	showTools: true, // show tools in navigation
} as const;
