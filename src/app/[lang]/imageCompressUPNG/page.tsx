import React from 'react';
//import ImageCompressor from '@/layouts/components/ImageCompressor';
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
    //const regularData = getSinglePage(path.join(language.contentDir, "pages"));
    // const data = regularData.filter(
    //     (page: RegularPage) => page.slug === "imageCompressor",
    // )[0];
    // const { frontmatter, content } = data;
    // const { title, meta_title, description, image } = frontmatter;
    
    //const textTipImgComp = getImageCompressorTextTip(path.join(language.contentDir, "about/_index.md"));
    const textTipImgComp = getImageCompressorTextTip(path.join(language.contentDir, "imageCompressor", "textTip.md"));
    const { frontmatterImgComp } = textTipImgComp;

    // const languageObj: ImageCompressorLanguage = {
    //     pageTitle: frontmatterImgComp.pageTitle,
    //     pageDescription: frontmatterImgComp.pageDescription,
    //     title: frontmatterImgComp.title,
    //     description: frontmatterImgComp.description,
    //     dropzoneText: frontmatterImgComp.dropzoneText,
    //     compressButton: frontmatterImgComp.compressButton,
    //     qualityLabel: frontmatterImgComp.qualityLabel,
    //     originalImage: frontmatterImgComp.originalImage,
    //     compressedImage: frontmatterImgComp.compressedImage,
    //     fileName: frontmatterImgComp.fileName,
    //     fileSize: frontmatterImgComp.fileSize,
    //     compressionRatio: frontmatterImgComp.compressionRatio,
    //     downloadButton: frontmatterImgComp.downloadButton,
    //     resizeOptionLabel: frontmatterImgComp.resizeOptionLabel,
    //     saveAllButton: frontmatterImgComp.saveAllButton,
    //     selectedFiles: frontmatterImgComp.selectedFiles,
    //     originalSize: frontmatterImgComp.originalSize,
    //     compressed: frontmatterImgComp.compressed
    // };

    const languageObj: ImageCompressorLanguage = {
        pageTitle: '图片压缩',
        pageDescription: '在线压缩您的图片，保持高质量',
        title: '图片压缩器',
        description: '上传并压缩您的PNG图片，减少文件大小',
        dropzoneText: '将PNG图片拖放到此处或点击上传',
        compressButton: '开始压缩',
        qualityLabel: '压缩质量',
        originalImage: '原始图片',
        compressedImage: '压缩后的图片',
        fileName: '文件名',
        fileSize: '文件大小',
        compressionRatio: '压缩比例',
        downloadButton: '下载压缩图片',
        resizeOptionLabel: 'Resize Option',
        saveAllButton: 'Save All',
        selectedFiles: '选择的文件',
        originalSize: '原始大小',
        compressed: '压缩后'
      };

    return (
        <>
            <HeadInfo
                lang={params.lang}
            />
            {/* <SeoMeta
                title={title}
                meta_title={meta_title}
                description={description}
                image={image}
            />
            <PageHeader title={title}>
                <Breadcrumbs lang={params.lang} />
            </PageHeader> */}
            <DynamicImageCompressor languageObj={languageObj} />
            {/* <section className="section">
                <div className="container">
                <div className="content">
                    <MDXContent content={content} />
                </div>
                </div>
            </section> */}
        </>
    );
};

export default ImageCompressUPNG;