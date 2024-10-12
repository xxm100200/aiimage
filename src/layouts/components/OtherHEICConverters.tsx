import React from 'react';
import Link from 'next/link';

interface Converter {
  name: string;
  description: string;
  url: string;
}

interface OtherHEICConvertersProps {
  converters: Converter[];
  translations: {
    title: string;
    convertNow: string;
  };
}

export default function OtherHEICConverters({ converters, translations }: OtherHEICConvertersProps) {
  return (
    <section className="section pt-0">
      <div className="container">
        <div className="row justify-center">
          <div className="mb-16 text-center lg:col-7">
            <h2>{translations.title}</h2>
          </div>
        </div>
        <div className="row gy-4 justify-center">
          {converters.map((converter, index) => (
            <div key={index} className="lg:col-4 md:col-6">
              <div className="rounded-lg bg-theme-light dark:bg-darkmode-theme-light p-8 shadow h-[250px] flex flex-col justify-between">
                <div>
                  <h3 className="h4 mb-3">{converter.name}</h3>
                  <p className="mb-4">{converter.description}</p>
                </div>
                <Link
                  href={converter.url}
                  className="btn btn-primary btn-sm mt-auto"
                >
                  {translations.convertNow}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}