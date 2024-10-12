"use client";

import languages from "@/config/language.json";
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const Jsonld = ({filePath}: {filePath: string;}) => {

    const pathname = usePathname();
    const [jsonldData, setJsonldData] = useState('');

    useEffect(() => {
        const fetchJsonld = async () => {
            console.log("fetchJsonld--------------fetchJsonld " + filePath)
            const response = await fetch(`/api/get_jsonld`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filePath }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();

            setJsonldData(jsonData.jsonld);
        };
    
        fetchJsonld();
    }, [pathname]);

    return (
        <>
            {jsonldData && (
                <Script
                    key={pathname}
                    id="json-ld"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonldData) }}
                />
            )}
        </>
    );
};

export default Jsonld;
