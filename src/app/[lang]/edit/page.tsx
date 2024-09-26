import BooksCard from "@/components/BooksCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import Pagination from "@/components/Pagination";
import config from "@/config/config.json";
import { getListPage, getSinglePage } from "@/lib/contentParser";
import { getActiveLanguages, getLanguageObj } from "@/lib/languageParser";
import { getAllTaxonomy, getTaxonomy } from "@/lib/taxonomyParser";
import { sortByDate } from "@/lib/utils/sortFunctions";
import PageHeader from "@/partials/PageHeader";
import PostSidebar from "@/partials/PostSidebar";
import SeoMeta from "@/partials/SeoMeta";
import { Post } from "@/types";
import path from "path";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import BlogEditor from '@/components/BlogEditor'
import HeadInfo from "@/components/HeadInfo";

// const BlogEditor = dynamic(() => import('@/components/BlogEditor'), {
//     ssr: false,
// });

const Edit = ({ params }: { params: { lang: string } }) => {
    const language = getLanguageObj(params.lang);
    return (
        <>
            <HeadInfo
                lang={params.lang}
            />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Edit Blog</h1>
                <Suspense fallback={<div>Loading editor...</div>}>
                    <BlogEditor lang={params.lang} />
                </Suspense>
            </div>
        </>
    );
};
  
export default Edit;