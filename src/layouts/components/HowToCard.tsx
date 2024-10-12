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

export default function HowToCard({ resource }: { resource: Resource }) {
    return (
        <div className="rounded-lg bg-theme-light px-7 py-10 dark:bg-darkmode-theme-light h-full">
            <Link href={resource.url} rel="noopener noreferrer" className="block h-[280px]">
                <div className="flex flex-col h-full items-center">
                    {resource.image && (
                        <div className="mb-4 h-[50px] w-[80px] flex justify-center">
                            <Image
                                src={resource.image}
                                alt={resource.name}
                                width={50}
                                height={50}
                                className="rounded-md object-cover"
                            />
                        </div>
                    )}
                    <h5 className="font-primary text-lg font-semibold mb-2 line-clamp-1 text-center">{resource.name}</h5>
                    
                    <blockquote
                        className="mt-8"
                        dangerouslySetInnerHTML={markdownify(resource.description)}
                    />
                    
                </div>
            </Link>
        </div>
    )
}