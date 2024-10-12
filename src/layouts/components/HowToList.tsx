// components/ResourceList.js
import Link from 'next/link'
import HowToCard from '@/components/HowToCard'

export default function HowToList({ resources }: { resources: any }) {
    return (
        <section className="section pt-7 pb-4">
            <div className="container">
                <div className="row">
                    <div className="mx-auto mb-12 text-center md:col-10 lg:col-8 xl:col-6">
                    <h2 className="mb-4">{resources.title}</h2>
                    <p>{resources.subtitle}</p>
                </div>
                    <div className="col-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resources.steps.map((resource: any) => (
                                <HowToCard key={resource.url} resource={resource} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}