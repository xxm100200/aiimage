'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import potrace from 'potrace';
import * as d3 from 'd3-color';
import { useTheme } from 'next-themes';

export default function ImageToSVG() {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const [image, setImage] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [colorSchemes, setColorSchemes] = useState<string[][]>([]);
  const [selectedScheme, setSelectedScheme] = useState<string[]>([]);

  const getBorderColor = () => {
    return theme === 'dark' ? '#3e3e3e' : '#d1d5db';
  };

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      setImage(files[0]);
      generateColorSchemes(files[0]);
    }
  };

  const generateColorSchemes = async (file: File) => {
    const imageData = await getImageData(file);
    const colors = extractColors(imageData);
    const isGradient = checkIfGradient(colors);
    const schemes = generateSchemes(colors, isGradient);
    setColorSchemes(schemes);
    setSelectedScheme(schemes[0]); // Default to the first scheme
  };

  const checkIfGradient = (colors: { color: string, percentage: number }[]): boolean => {
    // 如果前两种颜色的百分比之和超过90%，我们认为这可能是一个渐变图像
    return colors[0].percentage + colors[1].percentage > 90;
  };

  const getImageData = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const extractColors = (imageData: ImageData): { color: string, percentage: number }[] => {
    const { data, width, height } = imageData;
    const colorMap: { [key: string]: number } = {};
    const totalPixels = width * height;
  
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      if (a === 0) continue;
      
      // 使用量化来减少颜色数量
      const quantizedR = Math.round(r / 32) * 32;
      const quantizedG = Math.round(g / 32) * 32;
      const quantizedB = Math.round(b / 32) * 32;
      
      const key = `rgb(${quantizedR},${quantizedG},${quantizedB})`;
      colorMap[key] = (colorMap[key] || 0) + 1;
    }
  
    return Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)  // 增加到前5种颜色
      .map(([color, count]) => ({
        color,
        percentage: (count / totalPixels) * 100
      }));
  };
  
  const generateSchemes = (colors: { color: string, percentage: number }[], isGradient: boolean): string[][] => {
    const schemes = [];
  
    if (isGradient) {
      // 为渐变图像创建特殊的默认方案
      const gradientColors = colors.slice(0, 3).map(c => c.color);
      schemes.push(gradientColors);
    } else {
      // 保持原有的黑白默认方案
      schemes.push(['#FFFFFF', '#000000']);
    }
  
    // 生成其他配色方案
    for (let i = 0; i < colors.length; i++) {
      const scheme = colors.slice(0, i + 1).map(c => c.color);
      if (scheme.length < 2) {
        scheme.push('#FFFFFF');  // 如果只有一种颜色，添加白色作为背景
      }
      schemes.push(scheme);
    }
  
    return schemes;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isDragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isDragging);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    handleFiles(e.dataTransfer.files);
  };

  const convertToSVG = async () => {
    if (!image) return;

    setIsConverting(true);
    try {
      const svg = await traceSVG(image, selectedScheme);
      downloadSVG(svg);
    } catch (error) {
      console.error('Error converting image:', error);
      alert(t('conversionError'));
    } finally {
      setIsConverting(false);
    }
  };

  const traceSVG = (file: File, colors: string[]): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
  
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
  
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const colorSVGs = colors.map((color, index) => 
            traceColor(imageData, color, index === 0 && colors.length === 2)
          );
  
          Promise.all(colorSVGs).then(svgPaths => {
            const backgroundColor = colors[colors.length - 1];  // 使用最后一个颜色作为背景色
            const combinedSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
              <rect width="100%" height="100%" fill="${backgroundColor}"/>
              ${svgPaths.join('\n')}
            </svg>`;
            resolve(combinedSVG);
          }).catch(reject);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };
  
  const traceColor = (imageData: ImageData, color: string, isBlackAndWhite: boolean): Promise<string> => {
    return new Promise((resolve, reject) => {
      const { width, height, data } = imageData;
      const rgbColor = d3.rgb(color);
      const colorData = new Uint8ClampedArray(width * height * 4);
  
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        let value;
        if (isBlackAndWhite) {
          // For black and white, we want to invert the image
          value = (r + g + b) / 3 > 128 ? 0 : 255;
        } else {
          const distance = Math.sqrt(
            Math.pow(r - rgbColor.r, 2) +
            Math.pow(g - rgbColor.g, 2) +
            Math.pow(b - rgbColor.b, 2)
          );
          value = distance < 100 ? 0 : 255;
        }
        const index = i;
        colorData[index] = value;     // R
        colorData[index + 1] = value; // G
        colorData[index + 2] = value; // B
        colorData[index + 3] = 255;   // A (fully opaque)
      }
  
      const params = {
        color: color,
        background: 'transparent',
        threshold: 128,
        turdSize: 2,
        optCurve: true,
        optTolerance: 0.2,
      };
  
      potrace.trace(new ImageData(colorData, width, height), params, (err, svg) => {
        if (err) reject(err);
        else resolve(svg);
      });
    });
  };

  const downloadSVG = (svgContent: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_image.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl font-bold mb-4 text-center">{t('imageToSVG.title')}</h1>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={(e) => handleDragEvents(e, true)}
          onDragLeave={(e) => handleDragEvents(e, false)}
          onDragOver={(e) => handleDragEvents(e, true)}
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
          {image ? <p>{image.name}</p> : <p>{t('dropzoneText')}</p>}
        </div>
        {colorSchemes.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">{t('ColorSchemes')}</h2>
            <div className="flex flex-wrap gap-4">
              {colorSchemes.map((scheme, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedScheme(scheme)}
                  className={`p-2 rounded flex items-center justify-center`}
                  style={{
                    boxShadow: selectedScheme === scheme 
                      ? '0 0 0 2px #3b82f6' // 蓝色边框，对应 ring-2 ring-blue-500
                      : `0 0 0 2px ${getBorderColor()}`, // 动态边框颜色
                      height: '48px', // 设置一个固定高度
                  }}
                >
                  {scheme.map((color, colorIndex) => (
                    <span
                      key={colorIndex}
                      className="inline-block w-8 h-8 mr-1"
                      style={{ backgroundColor: color }}
                      title={color}
                    ></span>
                  ))}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-center mt-4">
          <button
            onClick={convertToSVG}
            disabled={!image || isConverting || colorSchemes.length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConverting ? t('converting') : t('convert')}
          </button>
        </div>
      </div>
    </div>
  );
}