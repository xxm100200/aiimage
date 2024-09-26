import fs from 'fs';
import path from 'path';
import { NextResponse, NextRequest } from "next/server";
import { getLanguageObj } from "@/lib/languageParser";

function DetermineTheFileName(articlePath) {
    // 获取 content 目录下的所有文件
    const contentDir = path.join(articlePath);
    const files = fs.readdirSync(contentDir);

    // 找出现有文件中最大的编号
    let maxNumber = 0;
    files.forEach((file) => {
    if (file.startsWith('post-') && file.endsWith('.md')) {
        const number = parseInt(file.substring(5, file.length - 3), 10);
            if (number > maxNumber) {
                maxNumber = number;
            }
        }
    });

    // 下一个文件的编号是现有最大编号加一
    const nextNumber = maxNumber + 1;

    // 创建新文件的路径
    const newFileName = `post-${nextNumber}`;
    const newFilePath = path.join(contentDir, newFileName);

    return newFileName;
};

function FormattingFileContents(article) {
    const currentUtcTime = new Date().toISOString().split('.')[0] + 'Z';
    const hrefLangEntries = Object.entries(article)
        .filter(([key]) => key.startsWith('hrefLang'))
        .map(([key, value]) => `${key}: "${value}"`);

    let markdownHeader = `---
title: "${article.title}"
meta_title: "${article.meta_title || article.title}"
description: "${article.description}"
date: ${currentUtcTime}
image: "/images/image-placeholder.png"
categories: ["${article.categories.split(', ').join('","')}"]
author: "John Doe"
tags: ["nextjs", "tailwind"]
draft: ${article.draft || false}
${hrefLangEntries.join('\n')}
---`.trim();
    const markdownContent = `${markdownHeader}\n\n${article.content}`;
    return markdownContent;
}

export async function POST(req) {
    if (req.method === 'POST') {
        try {
          const currentUtcTime = new Date().toISOString().split('.')[0] + 'Z';
          const { article, lang, fileName } = await req.json();
          const language = getLanguageObj(lang);
          console.log(" POST ---------------- " + fileName);
          const saveFileName = fileName ? fileName : DetermineTheFileName(process.cwd() + "/src/content/" + language.contentDir + "/blog")
          const filePath = path.join(process.cwd(), 'src', 'content', language.contentDir, 'blog', `${saveFileName}.md`);
          fs.writeFileSync(filePath, FormattingFileContents(article), 'utf-8');
          console.log(" POST ---------------- utcTime " + currentUtcTime)
          return NextResponse.json({ message: 'Article created successfully' });
        } catch (error) {
          console.error(error);
          console.log(" POST ---------------- error " + error)
          return NextResponse.json({ message: 'Article created error' });
        }
    } else {
        console.log(" No POST ---------------- *-* ")
        return NextResponse.json({ message: 'Article created not' });
    }
}