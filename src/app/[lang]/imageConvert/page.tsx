import React from 'react';
import HeadInfo from "@/components/HeadInfo";
import MDXContent from "@/helpers/MDXContent";
import { getSinglePage, getImageCompressorTextTip, getJsonFileData } from "@/lib/contentParser";
import { getActiveLanguages, getLanguageObj } from "@/lib/languageParser";
import SeoMeta from "@/partials/SeoMeta";
import { RegularPage, ImageCompressorLanguage } from "@/types";
import path from "path";
import PageHeader from "@/partials/PageHeader";
import Breadcrumbs from "@/components/Breadcrumbs";
import dynamic from 'next/dynamic';
import HowToList from '@/components/HowToList';
import Rate from "@/components/Rate";
import OtherHEICConverters from "@/layouts/components/OtherHEICConverters";

const DynamicImageToSVG = dynamic(
    () => import('@/components/ImageToSVG'),
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

const ImageConvert = ({ params }: { params: { lang: string } }) => {

    const language = getLanguageObj(params.lang);
    const regularData = getSinglePage(path.join(language.contentDir, "imageConvert"));
    const data = regularData.filter(
        (page: RegularPage) => page.slug === "imageConvert",
    )[0];
    const { frontmatter, content } = data;
    const { title, meta_title, description, image } = frontmatter;
    
    const textTipImgComp = getImageCompressorTextTip(path.join(language.contentDir, "imageConvert", "textTip.md"));
    const { frontmatterImgComp } = textTipImgComp;

    const howToImageCompress = getJsonFileData(path.join(language.contentDir, 'imageConvert', 'howTo.json'));
    const otherConverterImageCompress = getJsonFileData(path.join(language.contentDir, 'imageConvert', 'otherConverter.json'));
    const rate = getJsonFileData(path.join(language.contentDir, 'sections', 'rate.json'));

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
            <DynamicImageToSVG />
            <HowToList resources={howToImageCompress} />
            <section className="section">
                <div className="container">
                <div className="content">
                    <MDXContent content={content} />
                </div>
                </div>
            </section>
            <Rate translations={rate} />
            <OtherHEICConverters 
                converters={otherConverterImageCompress.related}
                translations={{
                title: otherConverterImageCompress.title,
                convertNow: otherConverterImageCompress.convertNow
                }}
            />
        </>
    );
};

export default ImageConvert;