import fs from 'fs';
import path from 'path';
import { NextResponse, NextRequest } from "next/server";
import { getSinglePage } from '@/lib/contentParser';

export async function POST(req) {
    if (req.method === 'POST') {
        try {
            console.log(" -+-+-++-+++-+-+-++---+-+++-+ ")
            const { blogUrl, header_fileName } = await req.json();
            console.log(" GET ---------------- blogUrl " + blogUrl + " header_fileName " + header_fileName)
            const regularData = getSinglePage(blogUrl);
            const blogName = header_fileName ? header_fileName.split('/').pop():"";
            const data = (regularData && header_fileName)?regularData.filter(
                (page) => page.slug?.includes(blogName),
            )[0]:null;

            const hrefLangData = Object.entries(data.frontmatter)
                .filter(([key]) => key.startsWith('hrefLang'))
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

            console.log(" GET ---------------- data.frontmatter " + data.frontmatter)
            return NextResponse.json({ 
                message: '200', 
                ...hrefLangData  // 展开所有 hrefLang 数据
            });

        } catch (error) {
            console.error('API 路由出现错误:', error);
            return NextResponse.json({ message: '500' });
        }
    } else {
        console.error(" No GET ---------------- *-* ")
        return NextResponse.json({ message: 'No GET' });
    }
}
