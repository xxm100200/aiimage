import { getLanguageObj } from "@/lib/languageParser";
import { ImageCompressResize } from "@/components/ImageCompressResize";

const ImageTool = ({ params }: { params: { lang: string } }) => {
    const language = getLanguageObj(params.lang);
    return (
        <>
            <ImageCompressResize />
        </>
    )
}

export default ImageTool;