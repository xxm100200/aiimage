import { getLanguageObj } from "@/lib/languageParser";
import { ImageCompress } from "@/components/ImageCompressTool";

const ImageTool = ({ params }: { params: { lang: string } }) => {
    const language = getLanguageObj(params.lang);
    return (
        <>
            <ImageCompress />
        </>
    )
}

export default ImageTool;