import React from 'react';
import HeadInfo from "@/components/HeadInfo";
import MDXContent from "@/helpers/MDXContent";
import { getSinglePage, getImageCompressorTextTip, getListPage } from "@/lib/contentParser";
import { getActiveLanguages, getLanguageObj } from "@/lib/languageParser";
import SeoMeta from "@/partials/SeoMeta";
import { RegularPage, ImageCompressorLanguage } from "@/types";
import path from "path";
import PageHeader from "@/partials/PageHeader";
import Breadcrumbs from "@/components/Breadcrumbs";
import dynamic from 'next/dynamic';

const DynamicImageCompressor = dynamic(
    () => import('@/components/ImageCompressor'),
    { ssr: false }
);

// remove dynamicParams
export const dynamicParams = false;

// generate static params
export async function generateStaticParams() {
    return getActiveLanguages().map((language) => ({
      lang: language.languageCode,
    }));
}

const ImageCompressUPNG = ({ params }: { params: { lang: string } }) => {

    const language = getLanguageObj(params.lang);
    const regularData = getSinglePage(path.join(language.contentDir, "pages"));
    const data = regularData.filter(
        (page: RegularPage) => page.slug === "imageCompressor",
    )[0];
    const { frontmatter, content } = data;
    const { title, meta_title, description, image } = frontmatter;
    
    const textTipImgComp = getImageCompressorTextTip(path.join(language.contentDir, "imageCompressor", "textTip.md"));
    const { frontmatterImgComp } = textTipImgComp;

    const languageObj: ImageCompressorLanguage = {
        pageTitle: frontmatterImgComp.pageTitle,
        pageDescription: frontmatterImgComp.pageDescription,
        title: frontmatterImgComp.title,
        description: frontmatterImgComp.description,
        dropzoneText: frontmatterImgComp.dropzoneText,
        compressButton: frontmatterImgComp.compressButton,
        qualityLabel: frontmatterImgComp.qualityLabel,
        originalImage: frontmatterImgComp.originalImage,
        compressedImage: frontmatterImgComp.compressedImage,
        fileName: frontmatterImgComp.fileName,
        fileSize: frontmatterImgComp.fileSize,
        compressionRatio: frontmatterImgComp.compressionRatio,
        downloadButton: frontmatterImgComp.downloadButton,
        resizeOptionLabel: frontmatterImgComp.resizeOptionLabel,
        saveAllButton: frontmatterImgComp.saveAllButton,
        selectedFiles: frontmatterImgComp.selectedFiles,
        originalSize: frontmatterImgComp.originalSize,
        compressed: frontmatterImgComp.compressed
    };

    return (
        <>
            <HeadInfo
                lang={params.lang}
            />
            <SeoMeta
                title={title}
                meta_title={meta_title}
                description={description}
                image={image}
            />
            <PageHeader title={title}>
                <Breadcrumbs lang={params.lang} />
            </PageHeader>
            <DynamicImageCompressor languageObj={languageObj} />
            <section className="section">
                <div className="container">
                <div className="content">
                    <MDXContent content={content} />
                </div>
                </div>
            </section>
        </>
    );
};

export default ImageCompressUPNG;