'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import ImageTracer from 'imagetracerjs';
import { optimize } from 'svgo/dist/svgo.browser';

export default function ImageToSVG() {
  const { t } = useTranslation('common');
  const [image, setImage] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      setImage(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const preprocessImage = (img: HTMLImageElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    // Set canvas dimensions
    canvas.width = img.width;
    canvas.height = img.height;

    // Apply image filters: brightness, contrast, and sharpen
    ctx.filter = 'brightness(110%) contrast(120%)';
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Implement a simple sharpen filter using convolution matrix
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const sharpenedData = applyConvolutionFilter(imageData, [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]);
    ctx.putImageData(sharpenedData, 0, 0);
  };

  const applyConvolutionFilter = (imageData: ImageData, kernel: number[]) => {
    const side = Math.round(Math.sqrt(kernel.length));
    const halfSide = Math.floor(side / 2);
    const src = imageData.data;
    const sw = imageData.width;
    const sh = imageData.height;
    const output = new Uint8ClampedArray(src.length);

    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        let r = 0, g = 0, b = 0;
        for (let ky = 0; ky < side; ky++) {
          for (let kx = 0; kx < side; kx++) {
            const pos = ((y + ky - halfSide) * sw + (x + kx - halfSide)) * 4;
            if (pos >= 0 && pos < src.length) {
              const weight = kernel[ky * side + kx];
              r += src[pos] * weight;
              g += src[pos + 1] * weight;
              b += src[pos + 2] * weight;
            }
          }
        }
        const idx = (y * sw + x) * 4;
        output[idx] = Math.min(Math.max(r, 0), 255);
        output[idx + 1] = Math.min(Math.max(g, 0), 255);
        output[idx + 2] = Math.min(Math.max(b, 0), 255);
        output[idx + 3] = src[idx + 3];
      }
    }

    return new ImageData(output, sw, sh);
  };

  const convertToSVG = async () => {
    if (!image) return;

    setIsConverting(true);
    try {
      const img = new Image();
      const url = URL.createObjectURL(image);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      preprocessImage(img, canvas);
      const processedDataURL = canvas.toDataURL('image/png');

      // Use ImageTracer to convert to SVG
      const tracedSVG = await new Promise<string>((resolve, reject) => {
        ImageTracer.imageToSVG(processedDataURL, (svgStr: string) => {
          resolve(svgStr);
        }, {
          ltres: 1,
          qtres: 1,
          pathomit: 1,
          colorsampling: 1,
          numberofcolors: 128,
          colorquantcycles: 3,
          mincolorratio: 0.01,
          quantclustersize: 4,
          scale: 1,
          simplify: 0.5,
          roundcoords: 1,
        });
      });

      // Optimize SVG using SVGO
      const optimizedSVG = optimize(tracedSVG, {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                removeUselessStrokeAndFill: false,
                mergePaths: false,
                convertPathData: {
                  floatPrecision: 5,
                },
                removeTitle: false,
                removeDesc: false,
              },
            },
          },
        ],
      });

      if (!optimizedSVG || !optimizedSVG.data) {
        throw new Error('SVG optimization failed');
      }

      // Adjust SVG size to match original image
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(optimizedSVG.data, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      svgElement.setAttribute('width', img.width.toString());
      svgElement.setAttribute('height', img.height.toString());
      svgElement.setAttribute('viewBox', `0 0 ${img.width} ${img.height}`);

      const finalSVG = new XMLSerializer().serializeToString(svgDoc);

      // Create a download link for the SVG
      const svgBlob = new Blob([finalSVG], { type: 'image/svg+xml' });
      const svgURL = URL.createObjectURL(svgBlob);
      const a = document.createElement('a');
      a.href = svgURL;
      a.download = 'converted_image.svg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(svgURL);
      a.remove();
    } catch (error) {
      console.error('Error converting image:', error);
      alert(t('conversionError'));
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl font-bold mb-4 text-center">{t('imageToSVG.title')}</h1>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {image ? (
            <p>{image.name}</p>
          ) : (
            <p>{t('dropzoneText')}</p>
          )}
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={convertToSVG}
            disabled={!image || isConverting}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition"
          >
            {isConverting ? t('converting') : t('convert')}
          </button>
        </div>
      </div>
    </div>
  );
}