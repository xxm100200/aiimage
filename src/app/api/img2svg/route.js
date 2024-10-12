// src/app/api/img2svg/route.js
// 必要的库安装：brew install pkg-config cairo pango libpng jpeg giflib librsvg

import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { optimize } from 'svgo';
import { createCanvas, Image } from 'canvas';
import { JSDOM } from 'jsdom';
import * as cheerio from 'cheerio'; // 使用命名空间导入

export const runtime = 'nodejs';

async function imageToSVG(buffer) {
  try {
    console.log('Starting imageToSVG conversion.');

    // 使用 Sharp 读取图像并获取元数据
    const sharpImage = sharp(buffer);
    const metadata = await sharpImage.metadata();
    const originalWidth = metadata.width;
    const originalHeight = metadata.height;
    console.log(`Image metadata - Width: ${originalWidth}, Height: ${originalHeight}`);

    // 缩放图像以提升细节捕捉（保持原尺寸）
    const scaleFactor = 1; // 不缩放
    const scaledWidth = originalWidth;
    const scaledHeight = originalHeight;
    console.log(`Scaling image by a factor of ${scaleFactor} to Width: ${scaledWidth}, Height: ${scaledHeight}`);

    // 图像预处理：提升对比度、亮度和锐化
    const pngBuffer = await sharpImage
      .resize(scaledWidth, scaledHeight, { fit: 'inside', withoutEnlargement: false })
      .modulate({
        brightness: 1.1, // 提升亮度
        contrast: 1.2,   // 提升对比度
      })
      .sharpen()         // 增加锐化
      .png()
      .toBuffer();
    console.log('Image converted to scaled and preprocessed PNG buffer with sharpening.');

    // 创建 Canvas 并绘制图像
    const canvas = createCanvas(scaledWidth, scaledHeight);
    const ctx = canvas.getContext('2d');
    // 禁用图像平滑
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    // 确保 Canvas 背景透明
    ctx.clearRect(0, 0, scaledWidth, scaledHeight);
    const img = new Image();
    img.src = pngBuffer;
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
    console.log('Image drawn on canvas with image smoothing disabled.');

    // 获取图像数据 URL
    const dataURL = canvas.toDataURL();
    console.log('Data URL obtained from canvas.');

    // 设置模拟的浏览器环境
    const dom = new JSDOM(`<!DOCTYPE html><body></body>`, {
      resources: 'usable',
      url: 'http://localhost',
    });
    global.window = dom.window;
    global.document = dom.window.document;
    global.Image = Image;

    // 动态导入 ImageTracer.js
    const ImageTracerModule = await import('imagetracerjs');
    const ImageTracer = ImageTracerModule.default || ImageTracerModule;

    // 使用 ImageTracer.js 将图像转换为 SVG
    const svgResult = await new Promise((resolve, reject) => {
      ImageTracer.imageToSVG(dataURL, function (svg) {
        if (svg) {
          console.log('ImageTracer successfully converted image to SVG.');
          resolve({
            svg: svg,
            originalWidth: originalWidth,
            originalHeight: originalHeight,
          });
        } else {
          console.error('ImageTracer returned an empty SVG string.');
          reject(new Error('ImageTracer returned an empty SVG string.'));
        }
      }, {
        ltres: 1,               // 增加线迹分辨率
        qtres: 1,               // 增加曲线分辨率
        pathomit: 1,            // 减少路径简化阈值
        colorsampling: 1,       // 使用角点颜色采样
        numberofcolors: 128,    // 增加颜色数量
        colorquantcycles: 3,
        mincolorratio: 0.01,    // 适度降低最小颜色比例
        quantclustersize: 4,
        scale: 1,               // 保持原始比例
        simplify: 0.5,          // 适度启用路径简化
        roundcoords: 1,         // 坐标四舍五入精度
      });
    });

    return svgResult;
  } catch (error) {
    console.error('ImageTracer error:', error);
    throw new Error('ImageTracer processing failed');
  }
}

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 限制文件大小为 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds limit (5MB)' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    console.log(`Received image file of size ${buffer.byteLength} bytes.`);

    const { svg, originalWidth, originalHeight } = await imageToSVG(Buffer.from(buffer));

    // 优化 SVG
    const optimizedSVG = optimize(svg, {
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
                floatPrecision: 5, // 提升路径精度
              },
              removeTitle: false, // 保留标题
              removeDesc: false,  // 保留描述
            },
          },
        },
        // 可选：根据需要添加其他插件，但避免与 preset-default 冲突
      ],
    });

    console.log(`Generated SVG size after SVGO optimization: ${optimizedSVG.data.length} bytes`);

    // 使用 cheerio 解析和修改 SVG 尺寸
    const $ = cheerio.load(optimizedSVG.data, { xmlMode: true });
    const svgElement = $('svg');

    // 设置 viewBox、width 和 height 属性为原始尺寸
    svgElement.attr('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
    svgElement.attr('width', originalWidth);
    svgElement.attr('height', originalHeight);

    // 获取修改后的 SVG 字符串
    const finalSVG = $.xml();
    console.log(`Final SVG size after adjustment: ${finalSVG.length} bytes`);

    return new NextResponse(finalSVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Error processing image' }, { status: 500 });
  }
}