#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 标签映射规则 - 优化版，更精准
const tagRules = [
  // 工具类
  { keywords: ['base64', 'url编码', 'url解码', 'json格式化', '时间戳', '颜色转换', '正则', '二维码', 'markdown转html', 'html转markdown'], tags: ['工具'] },
  { keywords: ['工具站', '免费工具', '在线工具'], tags: ['工具'] },

  // Git 相关
  { keywords: ['git', 'github', 'repo', 'submodule', 'commit', 'push', 'pull', 'clone', '分支', '仓库'], tags: ['Git'] },

  // Linux 服务器
  { keywords: ['linux', '服务器', '1panel', '宝塔', 'ssh', '命令行', '终端', 'bash', 'shell'], tags: ['Linux', '服务器'] },

  // Docker
  { keywords: ['docker', '容器', 'container', 'dockerfile', 'docker-compose'], tags: ['Docker'] },

  // 部署建站
  { keywords: ['netlify', 'vercel', '部署', 'deploy', 'hosting', '托管'], tags: ['部署', '建站'] },

  // 前端开发
  { keywords: ['next', 'react', 'vue', '前端', 'frontend', 'javascript', 'js', 'typescript', 'ts', 'css', 'html'], tags: ['前端', '开发'] },

  // Python 后端
  { keywords: ['python', 'flask', 'django', '后端', 'backend', 'pip', 'venv'], tags: ['Python', '后端'] },

  // SSL 安全
  { keywords: ['ssl', '证书', 'https', 'openssl', 'tls', 'ca', '自签名'], tags: ['SSL', '安全'] },

  // 网络 NAS
  { keywords: ['nas', 'ipv6', '内网', '网络', 'network', '端口', '防火墙'], tags: ['网络', 'NAS'] },

  // 图片处理
  { keywords: ['图片', 'image', '图床', '压缩', '裁剪', '转换', 'webp', 'jpg', 'png'], tags: ['图片'] },

  // 设计图标
  { keywords: ['图标', 'icon', 'iconpark', 'svg', '设计'], tags: ['设计', '图标'] },

  // Markdown 写作
  { keywords: ['markdown', 'md', '语法', '写作', '文档'], tags: ['Markdown', '写作'] },

  // 博客建站
  { keywords: ['qexo', 'hexo', '主题', 'theme', '博客', 'blog', '文章', '评论'], tags: ['博客', '建站'] },

  // Android
  { keywords: ['投屏', 'scrcpy', '手机', 'android', 'adb'], tags: ['Android'] },

  // 安全加密
  { keywords: ['隐藏', '加密', 'steganography', '密码', '安全'], tags: ['安全'] },

  // 教程
  { keywords: ['教程', 'guide', 'how to', '如何', '使用方法', '安装教程'], tags: ['教程'] },

  // 笔记
  { keywords: ['笔记', 'note', '记录', '学习笔记'], tags: ['笔记'] },

  // 测试
  { keywords: ['测试', 'test', 'demo', '示例'], tags: ['测试'] },

  // 域名
  { keywords: ['xlog', '域名', 'domain', 'dns', '解析'], tags: ['域名'] },

  // 自动化
  { keywords: ['自动化', 'automation', '脚本', 'script', 'cron', '定时任务'], tags: ['自动化'] },
];

// 根据内容生成标签
function generateTags(content) {
  const lowerContent = content.toLowerCase();
  const tags = new Set();

  for (const rule of tagRules) {
    for (const keyword of rule.keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        rule.tags.forEach(tag => tags.add(tag));
        break;
      }
    }
  }

  // 如果没有匹配到标签，使用默认标签
  if (tags.size === 0) {
    tags.add('others');
  }

  return Array.from(tags);
}

// 处理单个文件
function processFile(filePath, force = false) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // 查找 frontmatter
  let frontmatterEnd = -1;
  if (lines[0] === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        frontmatterEnd = i;
        break;
      }
    }
  }

  if (frontmatterEnd === -1) {
    console.log(`跳过（无 frontmatter）: ${path.basename(filePath)}`);
    return;
  }

  // 提取 frontmatter 和正文
  const frontmatter = lines.slice(0, frontmatterEnd + 1).join('\n');
  const body = lines.slice(frontmatterEnd + 1).join('\n');

  // 检查是否已有标签
  if (!force && frontmatter.includes('tags:')) {
    console.log(`已有标签: ${path.basename(filePath)}`);
    return;
  }

  // 生成标签
  const tags = generateTags(body + ' ' + frontmatter);

  // 更新 frontmatter - 删除旧标签，添加新标签
  let updatedFrontmatter = frontmatter.replace(/tags: \[.*?\]\n?/g, '');
  updatedFrontmatter = updatedFrontmatter.replace(
    /(---\n)/,
    `$1tags: ${JSON.stringify(tags)}\n`
  );

  // 写入文件
  const updatedContent = updatedFrontmatter + body;
  fs.writeFileSync(filePath, updatedContent, 'utf-8');

  console.log(`✅ 已更新: ${path.basename(filePath)} - 标签: ${tags.join(', ')}`);
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');

  const blogDir = path.join(__dirname, '../src/data/blog');
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

  console.log(`找到 ${files.length} 篇文章${force ? ' (强制更新)' : ''}\n`);

  let updated = 0;
  for (const file of files) {
    const filePath = path.join(blogDir, file);
    try {
      processFile(filePath, force);
      updated++;
    } catch (error) {
      console.error(`❌ 处理失败: ${file}`, error.message);
    }
  }

  console.log(`\n完成！共更新 ${updated} 篇文章`);
}

main();
