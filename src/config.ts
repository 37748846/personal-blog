export const SITE = {
	website: "https://lrbar.com/", // replace this with your deployed domain
	author: "爪爪",
	profile: "https://lrbar.com/",
	desc: "爪爪的博客 - 技术分享、生活记录、工具开发",
	title: "爪爪的博客",
	ogImage: "astropaper-og.jpg",
	lightAndDarkMode: true,
	postPerIndex: 4,
	postPerPage: 4,
	scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
	showArchives: true,
	showBackButton: true, // show back button in post detail
	editPost: {
		enabled: true,
		text: "Edit page",
		url: "https://github.com/37748846/personal-blog/edit/main/",
	},
	dynamicOgImage: true,
	dir: "ltr", // "rtl" | "auto"
	lang: "zh-CN", // html lang code. Set this empty and default will be "en"
	timezone: "Asia/Shanghai", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
