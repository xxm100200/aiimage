'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import UPNG from 'upng-js';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ImageCompressorLanguage } from "@/types";

interface ImageCompressorProps {
  languageObj: ImageCompressorLanguage;
}

interface CompressedImage {
  original: File;
  compressed: Blob;
  ratio: string;
  progress: number;
}

//const ImageCompressor: React.FC<ImageCompressorProps> = ({ languageObj }) => {
const ImageCompressor = ({ languageObj } : { languageObj: ImageCompressorLanguage }) => {
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [cnum, setCnum] = useState<number>(256);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      compressedImages.forEach((item) => {
        URL.revokeObjectURL(URL.createObjectURL(item.compressed));
      });
    };
  }, [compressedImages]);

  const handleFiles = (files: FileList | null) => {
    if (files) {
      const filesArray = Array.from(files).filter(file => file.type === 'image/png');
      if (filesArray.length !== files.length) {
        setErrorMessages([...errorMessages, '仅支持上传PNG格式的图片。']);
      }
      //setOriginalFiles(prevFiles => [...prevFiles, ...filesArray]);
      setOriginalFiles(filesArray);
      setCompressedImages([]);
      setErrorMessages([]);
      compressFiles(filesArray);
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

  const resizeImage = useCallback((file: File, maxWidth: number, maxHeight: number): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (aspectRatio > 1) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas);
        } else {
          reject(new Error('无法获取Canvas上下文'));
        }
      };
      img.onerror = () => {
        reject(new Error('无法加载图片'));
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const compressFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsCompressing(true);
    const results: CompressedImage[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        setCompressedImages(prev => [
          ...prev,
          { original: file, compressed: new Blob(), ratio: '0%', progress: 0 }
        ]);

        const canvas = await resizeImage(file, 1920, 1920);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('无法获取Canvas上下文');
        }

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const compressedArrayBuffer = UPNG.encode([imgData.data.buffer], canvas.width, canvas.height, cnum === 0 ? 0 : Math.min(cnum, 256));
        const compressedBlob = new Blob([compressedArrayBuffer], { type: 'image/png' });

        const ratio = ((file.size - compressedBlob.size) / file.size * 100).toFixed(2);
        
        setCompressedImages(prev => {
          const newState = [...prev];
          newState[i] = {
            original: file,
            compressed: compressedBlob,
            ratio: `${ratio}%`,
            progress: 100
          };
          return newState;
        });
      } catch (error) {
        console.error(`压缩 ${file.name} 失败:`, error);
        errors.push(`图片 ${file.name} 压缩失败，请重试。`);
        setCompressedImages(prev => {
          const newState = [...prev];
          newState[i] = {
            ...newState[i],
            progress: 100,
            ratio: 'Failed'
          };
          return newState;
        });
      }
    }

    setErrorMessages(errors);
    setIsCompressing(false);
  };

  const handleSingleDownload = useCallback((item: CompressedImage) => {
    saveAs(item.compressed, item.original.name.replace('.png', '_compressed.png'));
  }, []);

  const handleSaveAll = useCallback(async () => {
    if (compressedImages.length === 0) return;

    const zip = new JSZip();
    
    compressedImages.forEach((item, index) => {
      const fileName = item.original.name.replace('.png', '_compressed.png');
      zip.file(fileName, item.compressed);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'compressed_images.zip');
  }, [compressedImages]);

  return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">{languageObj.title}</h1>
            <p className="text-gray-600 dark:text-gray-300">{languageObj.description}</p>
            </div>
            
            <div className="max-w-4xl mx-auto mb-8">
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
                <p className="text-xl text-gray-600 dark:text-gray-300">{languageObj.dropzoneText}</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {originalFiles.length > 0 && (
                <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">{languageObj.selectedFiles}:</h3>
                <ul className="list-disc pl-5">
                    {originalFiles.map((file, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300">{file.name}</li>
                    ))}
                </ul>
                </div>
            )}

            {(
                <div className="mt-6">
                <label htmlFor="quality-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {languageObj.qualityLabel}
                </label>
                <div className="flex items-center">
                    <input
                    id="quality-slider"
                    type="range"
                    min="50"
                    max="256"
                    value={cnum}
                    onChange={(e) => setCnum(parseInt(e.target.value))}
                    className="flex-1 mr-4"
                    />
                    <span className="text-gray-700 dark:text-gray-200">
                    {cnum}
                    </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {languageObj.resizeOptionLabel || '选择压缩质量以平衡压缩率和图片质量'}
                </p>
                </div>
            )}

            {errorMessages.length > 0 && (
                <div className="mt-6">
                {errorMessages.map((msg, idx) => (
                    <p key={idx} className="text-red-500 dark:text-red-400">
                    {msg}
                    </p>
                ))}
                </div>
            )}
            </div>

            {compressedImages.length > 0 && (
                <div className="mt-12 max-w-4xl mx-auto">
                    <div className="space-y-4">
                        {compressedImages.map((item, index) => (
                            <div key={index} className="flex items-center bg-white dark:bg-darkmode-theme-light p-4 rounded-lg shadow">
                                <img
                                    src={URL.createObjectURL(item.compressed)}
                                    alt={`压缩后的 ${item.original.name}`}
                                    className="w-16 h-16 object-cover rounded mr-4"
                                />
                                <div className="flex-grow">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{item.original.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {languageObj.originalSize}: {(item.original.size / 1024).toFixed(2)} KB | 
                                    {languageObj.compressed}: {(item.compressed.size / 1024).toFixed(2)} KB | 
                                    {languageObj.compressionRatio}: {item.ratio}
                                </p>
                                {item.progress < 100 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${item.progress}%`}}></div>
                                    </div>
                                )}
                                </div>
                                <button
                                    onClick={() => handleSingleDownload(item)}
                                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                    disabled={item.progress < 100}
                                >
                                    {languageObj.downloadButton}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center mb-6 mt-6">
                        <button
                            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition"
                            onClick={handleSaveAll}
                        >
                            {languageObj.saveAllButton || 'Save All'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageCompressor;