'use client';

import languages from "@/config/language.json";
import { usePathname } from "next/navigation";
import { getLanguageObj } from "@/lib/languageParser";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArticleState } from "@/types";

function GetHrefFromLang(origin: string, lang: string, itemLang: string) {
    const pathname = usePathname();
    if (lang == 'en') {
        return `${origin}/${itemLang}${pathname}`;
    }else {
        const pathname2 = pathname;
        const parts = pathname2.split('/', 3); // 分割字符串至第二个'/'
        const pathNoLang = parts.slice(2).join('/'); // 重新连接剩余部分
        return `${origin}/${itemLang}/${pathNoLang}`;
    }
}

const HeadInfo = ({lang = "en"}: {lang?: string;}) => {

    const pathname = usePathname();
    const [origin, setOrigin] = useState<string>('');
    const [canonical, setCanonical] = useState<string>('');
    const [jsonLd, setJsonLd] = useState<string>('');
    const jsonLdRef = useRef<string>('');
    useEffect(() => {
        setOrigin(window.location.origin);
        setCanonical(window.location.origin + pathname);
    }, [pathname]);

    const language = getLanguageObj(lang);
    const header_fileNameParam = pathname.split('/').pop();

    const initialArticleState: ArticleState = {
        title: '',
        description: '',
        categories: '',
        content: '',
        path: '',
        ...Object.fromEntries(languages.map(lang => [`hrefLang${lang.languageName}`, '']))
    };

    const [article, setArticle] = useState<ArticleState>(initialArticleState);
    
    const isBlogPost = () => {
        const regex = /\/blog\/(?!page\/).[^/]+/;
        return regex.test(pathname);
    };

    useEffect(() => {
        const fetchGetHref = async () => {
            try {
                console.log(" fetchGetHref--------------fetchGetHref " + pathname)
                if(!isBlogPost()) {
                    console.log(" =.=.=.=.=.= no /blog/");
                    return null;
                }
                console.log(" =.=.=.=.=.= fetchGet --==--");

                const blogUrl = language.contentDir + "/blog";
                const header_fileName = header_fileNameParam;
                const response = await fetch(`/api/get_href`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ blogUrl, header_fileName }),
                });
        
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const jsonData = await response.json();
                setArticle(prevArticle => ({
                    ...prevArticle,
                    ...Object.entries(jsonData)
                      .filter(([key]) => key.startsWith('hrefLang'))
                      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
                }));
            } catch (error) {
                console.error('Fetching error:', error);
            }
        };

        async function loadJsonLd() {
            try {
                const response = await fetch(`/api/json_ld`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ lang: lang, pagePath:header_fileNameParam }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                jsonLdRef.current = data.jsonLd;
                setJsonLd(data.jsonLd);
            } catch (error) {
                console.error('Failed to load JSON-LD:', error);
            }
        }
        
        fetchGetHref();
        loadJsonLd();

    }, [pathname]); 

    useEffect(() => {
        if (jsonLd) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = jsonLd;
            document.head.appendChild(script);
    
            return () => {
                document.head.removeChild(script);
            };
        }
    }, [jsonLd]);

    const x_de = () => {
        let hrefLang = 'x-default';
        let href = `${origin}/${hrefLang}${pathname}`;
        if (isBlogPost()) {
            href = `${article[`hrefLangEn`]}`
        }else {
            href = GetHrefFromLang(origin, lang, "en");
        }
        return origin ? <link key={href} rel="alternate" hrefLang='x-default' href={href}/> : null
    }

    return (
        <>
        {/* canonical url */}
        {canonical && <link rel="canonical" href={canonical}/>}
        {
            x_de()
        }
        {
            languages.map((item) => {
                let hrefLang = item.languageCode;
                let href = `${origin}/${item.languageCode}${pathname}`;
                if (isBlogPost()) {
                    href = `${article[`hrefLang${item.languageName}`]}`
                }else {
                    href = GetHrefFromLang(origin, lang, hrefLang);
                }
                return origin ? <link key={href} rel="alternate" hrefLang={hrefLang} href={href}/> : null;
            })
        }
        </>
    );
};

export default HeadInfo;
