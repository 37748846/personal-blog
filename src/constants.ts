import type { Props } from "astro";
import IconMail from "@/assets/icons/IconMail.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconWhatsapp from "@/assets/icons/IconWhatsapp.svg";
import IconFacebook from "@/assets/icons/IconFacebook.svg";
import IconTelegram from "@/assets/icons/IconTelegram.svg";
import IconPinterest from "@/assets/icons/IconPinterest.svg";
import IconWechat from "@/assets/icons/IconWechat.svg";
import IconWeibo from "@/assets/icons/IconWeibo.svg";
import IconQQ from "@/assets/icons/IconQQ.svg";
import IconXiaohongshu from "@/assets/icons/IconXiaohongshu.svg";
import IconDouyin from "@/assets/icons/IconDouyin.svg";
import IconBilibili from "@/assets/icons/IconBilibili.svg";
import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/37748846",
    linkTitle: `${SITE.title} on GitHub`,
    icon: IconGitHub,
  },
  // {
  //   name: "X",
  //   href: "https://x.com/username",
  //   linkTitle: `${SITE.title} on X`,
  //   icon: IconBrandX,
  // },
  // {
  //   name: "LinkedIn",
  //   href: "https://www.linkedin.com/in/username/",
  //   linkTitle: `${SITE.title} on LinkedIn`,
  //   icon: IconLinkedin,
  // },
  {
    name: "Mail",
    href: "mailto:yourmail@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: IconMail,
  },
] as const;

export const SHARE_LINKS: Social[] = [
  {
    name: "WeChat",
    href: "weixin://",
    linkTitle: `Share this post via WeChat`,
    icon: IconWechat,
  },
  {
    name: "Weibo",
    href: "https://service.weibo.com/share/share.php?url=",
    linkTitle: `Share this post on Weibo`,
    icon: IconWeibo,
  },
  {
    name: "QQ",
    href: "https://connect.qq.com/widget/shareqq/index.html?url=",
    linkTitle: `Share this post via QQ`,
    icon: IconQQ,
  },
  {
    name: "Xiaohongshu",
    href: "https://www.xiaohongshu.com/discovery/item/",
    linkTitle: `Share this post on Xiaohongshu`,
    icon: IconXiaohongshu,
  },
  {
    name: "Douyin",
    href: "https://www.douyin.com/",
    linkTitle: `Share this post on Douyin`,
    icon: IconDouyin,
  },
  {
    name: "Bilibili",
    href: "https://www.bilibili.com/",
    linkTitle: `Share this post on Bilibili`,
    icon: IconBilibili,
  },
  // {
  //   name: "WhatsApp",
  //   href: "https://wa.me/?text=",
  //   linkTitle: `Share this post via WhatsApp`,
  //   icon: IconWhatsapp,
  // },
  // {
  //   name: "Facebook",
  //   href: "https://www.facebook.com/sharer.php?u=",
  //   linkTitle: `Share this post on Facebook`,
  //   icon: IconFacebook,
  // },
  // {
  //   name: "X",
  //   href: "https://x.com/intent/post?url=",
  //   linkTitle: `Share this post on X`,
  //   icon: IconBrandX,
  // },
  // {
  //   name: "Telegram",
  //   href: "https://t.me/share/url?url=",
  //   linkTitle: `Share this post via Telegram`,
  //   icon: IconTelegram,
  // },
  // {
  //   name: "Pinterest",
  //   href: "https://pinterest.com/pin/create/button/?url=",
  //   linkTitle: `Share this post on Pinterest`,
  //   icon: IconPinterest,
  // },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
    icon: IconMail,
  },
] as const;
