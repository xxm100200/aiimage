import Link from 'next/link'
import { cn } from "@/lib/utils"
import Image from 'next/image'
import { markdownify } from "@/lib/utils/textConverter";

interface Resource {
    name: string;
    description: string;
    url: string;
    image: string;
}
/** */
//{cn("rounded-lg bg-card text-card-foreground shadow-sm h-full p-4 flex flex-col")}
export default function FunctionCard({ resource }: { resource: Resource }) {
    return (
        <div className="rounded-lg bg-theme-light px-7 py-10 dark:bg-darkmode-theme-light h-full">
            <Link href={resource.url} target="_blank" rel="noopener noreferrer" className="block h-[280px]">
                <div className="flex flex-col h-full">
                    {resource.image && (
                        <div className="mb-4 h-[50px] w-[80px]">
                            <Image
                                src={resource.image}
                                alt={resource.name}
                                width={50}
                                height={50}
                                className="rounded-md object-cover"
                            />
                        </div>
                    )}
                    <h5 className="font-primary stext-lg font-semibold mb-2 line-clamp-1">{resource.name}</h5>
                    {/* <p className="text-dark dark:text-white flex-grow overflow-hidden line-clamp-3">{resource.description}</p> */}
                    <blockquote
                        className="mt-8"
                        dangerouslySetInnerHTML={markdownify(resource.description)}
                    />
                </div>
            </Link>
        </div>
    )
}