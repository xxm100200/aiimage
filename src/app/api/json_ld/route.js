import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getLanguageObj } from "@/lib/languageParser";

async function IsExistsFileInDir(filePath, fileName) {
    const fullPath = path.join(filePath, fileName);
    try {
        await fs.access(fullPath);
        return true;
    } catch {
        return false;
    }
}

export async function POST(req) {
    if (req.method === 'POST') {
        const { lang, pagePath } = await req.json();
        const language = getLanguageObj(lang);
        if (typeof pagePath !== 'string') {
            return NextResponse.json({ message: '400' });
        }
        var pageName = pagePath ? pagePath : "home";
        const isExists = await IsExistsFileInDir(process.cwd() + "/src/content/" + language.contentDir + "/json_ld", `${pageName}.md`)
        if (!isExists) {
            return NextResponse.json({ message: '200', jsonLd: "" });
        }
        console.log("json_ld ---------=====---------- isExists " + isExists + " " + pageName)
        try {
            const filePath = path.join(process.cwd(), 'src', 'content', language.contentDir, 'json_ld', `${pageName}.md`);
            console.log(" json_ld --path " + filePath)
            const fileContent =  await fs.readFile(filePath, 'utf-8');
            console.log(" json_ld ---------=====---------- fileContent " + fileContent)
            return NextResponse.json({ message: '200', jsonLd: fileContent });
        } catch (error) {
            console.error('Error reading JSON-LD file:', error);
            return NextResponse.json({ message: '404' });
        }
    } else {
        console.log(" No POST ---------------- *-* ")
        return NextResponse.json({ message: 'Article created not' });
    }
}