import fs from 'fs';
import path from 'path';
import { NextResponse, NextRequest } from "next/server";
import { getListPage } from "@/lib/contentParser";

export async function POST(req) {
    if (req.method === 'POST') {
        try {
            const { filePath } = await req.json();
            console.log(" Jsonld-+-+-++-+++-+-+-++---+-+++-+Jsonld " + filePath)

            const jsonData = getListPage(filePath);
            const { frontmatter } = jsonData;
            const { jsonld } = frontmatter;

            console.log(" GET ---------------- jsonld " + jsonld)
            return NextResponse.json({ 
                message: '200', 
                jsonld: jsonld  // 展开所有 hrefLang 数据
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
