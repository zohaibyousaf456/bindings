'use client';

import { useState } from 'react';
import { removeBackground } from '@imgly/background-removal';

export default function BackgroundRemovalPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setProcessedImage(null);
    }
  };

  // Enhanced edge smoothing with adaptive filtering
  const smoothEdges = async (imageBlob: Blob) => {
    const img = await createImageBitmap(imageBlob);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Edge detection and smoothing
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const alpha = data[idx + 3];
        
        // Only process edge pixels
        if (alpha > 0 && alpha < 255) {
          // Apply gaussian-like smoothing to alpha channel
          let alphaSum = 0;
          let count = 0;
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4;
              alphaSum += data[nIdx + 3];
              count++;
            }
          }
          
          data[idx + 3] = Math.round(alphaSum / count);
        }
      }
    }
    
    ctx.putImageData(imgData, 0, 0);
    
    return new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => b && resolve(b), 'image/png')
    );
  };

  // Advanced shadow and reflection removal using multiple techniques
  const removeShadowsAndReflections = async (imageBlob: Blob) => {
    const img = await createImageBitmap(imageBlob);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Create a copy for comparison
    const originalData = new Uint8ClampedArray(data);

    // Step 1: Advanced shadow detection using luminance and color analysis
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
        
        // Skip transparent pixels
        if (a < 10) continue;

        // Calculate luminance
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Calculate local contrast by comparing with neighbors
        let neighborSum = 0, neighborCount = 0;
        let maxNeighbor = 0, minNeighbor = 255;
        
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            if (data[nIdx + 3] > 10) { // Only consider non-transparent neighbors
              const nLum = 0.299 * data[nIdx] + 0.587 * data[nIdx + 1] + 0.114 * data[nIdx + 2];
              neighborSum += nLum;
              neighborCount++;
              maxNeighbor = Math.max(maxNeighbor, nLum);
              minNeighbor = Math.min(minNeighbor, nLum);
            }
          }
        }

        if (neighborCount > 0) {
          const avgNeighborLum = neighborSum / neighborCount;
          const contrast = avgNeighborLum - luminance;
          const localVariance = maxNeighbor - minNeighbor;

          // Color saturation
          const saturation = (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(r, g, b, 1);

          // Detect shadows: darker than neighbors with low saturation and consistent color
          const isShadow = contrast > 25 && saturation < 0.3 && luminance < 130 && localVariance > 20;

          // Detect reflections: bright spots with high luminance or specular highlights
          const isReflection = luminance > 180 && (
            (r > 200 && g > 200 && b > 200) || // White highlights
            saturation < 0.1 || // Desaturated bright areas
            (contrast < -30 && luminance > avgNeighborLum * 1.3) // Much brighter than surroundings
          );

          if (isShadow) {
            // Intelligent shadow lifting
            const shadowStrength = Math.min(contrast / 50, 0.8);
            const brightenFactor = 1 + shadowStrength * 0.6;
            
            // Preserve color relationships while brightening
            const maxChannel = Math.max(r, g, b);
            if (maxChannel > 0) {
              const colorRatio = [r/maxChannel, g/maxChannel, b/maxChannel];
              const newMax = Math.min(255, maxChannel * brightenFactor);
              
              data[idx] = Math.round(newMax * colorRatio[0]);
              data[idx + 1] = Math.round(newMax * colorRatio[1]);
              data[idx + 2] = Math.round(newMax * colorRatio[2]);
            }
          } else if (isReflection) {
            // Sophisticated reflection removal
            let sumR = 0, sumG = 0, sumB = 0, validNeighbors = 0;
            let sumLum = 0;
            
            // Sample from a larger area to find representative colors
            for (let dy = -3; dy <= 3; dy++) {
              for (let dx = -3; dx <= 3; dx++) {
                if (Math.abs(dx) + Math.abs(dy) > 4) continue; // Diamond pattern
                const nIdx = ((y + dy) * width + (x + dx)) * 4;
                if (y + dy >= 0 && y + dy < height && x + dx >= 0 && x + dx < width && data[nIdx + 3] > 10) {
                  const nLum = 0.299 * data[nIdx] + 0.587 * data[nIdx + 1] + 0.114 * data[nIdx + 2];
                  const nSat = (Math.max(data[nIdx], data[nIdx + 1], data[nIdx + 2]) - 
                               Math.min(data[nIdx], data[nIdx + 1], data[nIdx + 2])) / 
                               Math.max(data[nIdx], data[nIdx + 1], data[nIdx + 2], 1);
                  
                  // Only use non-reflective neighbors with some color information
                  if (nLum < luminance * 0.9 && nSat > 0.1) {
                    sumR += data[nIdx];
                    sumG += data[nIdx + 1];
                    sumB += data[nIdx + 2];
                    sumLum += nLum;
                    validNeighbors++;
                  }
                }
              }
            }
            
            if (validNeighbors > 3) {
              const avgR = sumR / validNeighbors;
              const avgG = sumG / validNeighbors;
              const avgB = sumB / validNeighbors;
              const avgLum = sumLum / validNeighbors;
              
              // Adaptive blending based on reflection strength
              const reflectionStrength = (luminance - avgLum) / Math.max(avgLum, 50);
              const blendFactor = Math.min(0.8, Math.max(0.3, reflectionStrength * 0.4));
              
              data[idx] = Math.round(r * (1 - blendFactor) + avgR * blendFactor);
              data[idx + 1] = Math.round(g * (1 - blendFactor) + avgG * blendFactor);
              data[idx + 2] = Math.round(b * (1 - blendFactor) + avgB * blendFactor);
            }
          }
        }
      }
    }

    // Step 2: Apply the processed data
    ctx.putImageData(imgData, 0, 0);

    // Step 3: Subtle post-processing for natural appearance
    const postCanvas = document.createElement('canvas');
    postCanvas.width = width;
    postCanvas.height = height;
    const postCtx = postCanvas.getContext('2d')!;
    
    // Very light blur for smooth transitions
    postCtx.filter = 'blur(0.3px)';
    postCtx.drawImage(canvas, 0, 0);
    
    // Blend back some original for naturalness
    ctx.filter = 'none';
    ctx.globalAlpha = 0.85;
    ctx.drawImage(postCanvas, 0, 0);
    ctx.globalAlpha = 0.15;
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = 1.0;

    return new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => b && resolve(b), 'image/png')
    );
  };

  // Color correction for better overall appearance
  const enhanceColors = async (imageBlob: Blob) => {
    const img = await createImageBitmap(imageBlob);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Enhance contrast and saturation slightly
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 10) { // Only process non-transparent pixels
        // Slight contrast enhancement
        const r = Math.min(255, Math.max(0, (data[i] - 128) * 1.1 + 128));
        const g = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.1 + 128));
        const b = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.1 + 128));
        
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    return new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => b && resolve(b), 'image/png')
    );
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      // Step 1: Remove background using imgly
      console.log('Removing background...');
      const bgRemovedBlob = await removeBackground(selectedImage);

      // Step 2: Remove shadows and reflections
      console.log('Removing shadows and reflections...');
      const cleanedBlob = await removeShadowsAndReflections(bgRemovedBlob);

      // Step 3: Smooth edges
      console.log('Smoothing edges...');
      const smoothedBlob = await smoothEdges(cleanedBlob);

      // Step 4: Enhance colors
      console.log('Enhancing colors...');
      const enhancedBlob = await enhanceColors(smoothedBlob);

      const url = URL.createObjectURL(enhancedBlob);
      setProcessedImage(url);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'background-removed.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Advanced Background Removal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload any image and automatically remove the background with enhanced shadow and reflection removal. 
            Perfect for product photos, portraits, and design projects.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="text-center">
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-gray-700 mb-2">Click to upload an image</p>
                <p className="text-sm text-gray-500">Support for JPG, PNG up to 10MB</p>
              </div>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Process Button */}
        {selectedImage && !processedImage && (
          <div className="text-center mb-8">
            {isProcessing ? (
              <div className="inline-flex items-center space-x-3 bg-blue-50 border border-blue-200 text-blue-700 px-8 py-4 rounded-lg">
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-lg font-medium">Processing image with advanced algorithms...</span>
              </div>
            ) : (
              <button
                onClick={handleRemoveBackground}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Remove Background & Clean Shadows
              </button>
            )}
          </div>
        )}

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original Image */}
          {selectedImage && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Image</h3>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Processed Image */}
          {processedImage && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Processed Image</h3>
                <button
                  onClick={downloadImage}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Download
                </button>
              </div>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden" style={{
                backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}>
                <img
                  src={processedImage}
                  alt="Processed"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Advanced Processing Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Background Removal</h3>
              <p className="text-gray-600 text-sm">Powered by imgly's advanced AI algorithms</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Shadow Removal</h3>
              <p className="text-gray-600 text-sm">Intelligent detection and removal of cast shadows</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reflection Cleanup</h3>
              <p className="text-gray-600 text-sm">Advanced reflection and specular highlight removal</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Edge Smoothing</h3>
              <p className="text-gray-600 text-sm">Professional edge refinement and smoothing</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}