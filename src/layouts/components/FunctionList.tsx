// components/ResourceList.js
import Link from 'next/link'
import FunctionCard from '@/components/FunctionCard'

export default function FunctionList({ resources }: { resources: any }) {
    return (
        <section className="section">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resources.map((resource: any) => (
                                <FunctionCard key={resource.url} resource={resource} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}