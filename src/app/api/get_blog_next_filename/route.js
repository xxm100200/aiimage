import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
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

export async function POST(req) {
    if (req.method === 'POST') {
        try {
          const { lang } = await req.json();
          const language = getLanguageObj(lang);
          const fileName = DetermineTheFileName(process.cwd() + "/src/content/" + language.contentDir + "/blog")
          return NextResponse.json({ message: 'Article created successfully', nextFileName: fileName });
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