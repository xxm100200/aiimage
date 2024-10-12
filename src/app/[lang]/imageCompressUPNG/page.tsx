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

const DynamicImageCompressor = dynamic(
    () => import('@/components/ImageCompressorUPNG'),
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
    const regularData = getSinglePage(path.join(language.contentDir, "imageCompressorUPNG"));
    let data, frontmatter, content;
    try {
        data = regularData.filter(
            (page: RegularPage) => page.slug === "imageCompressorUPNG",
        )[0];
        if (!data) {
            throw new Error("Image compressor data not found");
        }
        ({ frontmatter, content } = data);
    } catch (error) {
        console.error("Error processing image compressor data:", error);
        // Provide fallback values
        frontmatter = {
            title: "Image Compressor",
            meta_title: "Image Compressor",
            description: "Compress your images easily",
            image: "/default-image.jpg"
        };
        content = "Content not available";
    }

    const { title, meta_title, description, image } = frontmatter;
    
    // Add similar error handling for other data fetching functions
    let textTipImgComp, frontmatterImgComp, howToImageCompress, otherConverterImageCompress, rate;
    try {
        textTipImgComp = getImageCompressorTextTip(path.join(language.contentDir, "imageCompressorUPNG", "textTip.md"));
        ({ frontmatterImgComp } = textTipImgComp);
        howToImageCompress = getJsonFileData(path.join(language.contentDir, 'imageCompressorUPNG', 'howTo.json'));
        otherConverterImageCompress = getJsonFileData(path.join(language.contentDir, 'imageCompressorUPNG', 'otherConverter.json'));
        rate = getJsonFileData(path.join(language.contentDir, 'sections', 'rate.json'));
    } catch (error) {
        console.error("Error fetching additional data:", error);
        // Provide fallback values for these as well
        frontmatterImgComp = {
            pageTitle: "Image Compressor",
            pageDescription: "Compress your images",
            // ... add other necessary fallback properties
        };
        howToImageCompress = [];
        otherConverterImageCompress = { related: [], title: "Other Converters", convertNow: "Convert Now" };
        rate = {};
    }

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

export default ImageCompressUPNG;