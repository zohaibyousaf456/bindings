// Advanced image processing utilities for shadow and reflection removal

export interface ProcessingOptions {
  shadowRemoval: boolean;
  reflectionRemoval: boolean;
  edgeSmoothing: boolean;
  colorCorrection: boolean;
  preserveDetails: boolean;
}

export const DEFAULT_OPTIONS: ProcessingOptions = {
  shadowRemoval: true,
  reflectionRemoval: true,
  edgeSmoothing: true,
  colorCorrection: true,
  preserveDetails: true,
};

// Advanced morphological operations
export class MorphologyProcessor {
  static createKernel(size: number, shape: 'circle' | 'square' = 'circle'): number[][] {
    const kernel: number[][] = [];
    const center = Math.floor(size / 2);
    
    for (let y = 0; y < size; y++) {
      kernel[y] = [];
      for (let x = 0; x < size; x++) {
        if (shape === 'circle') {
          const distance = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
          kernel[y][x] = distance <= center ? 1 : 0;
        } else {
          kernel[y][x] = 1;
        }
      }
    }
    return kernel;
  }

  static erode(imageData: ImageData, kernel: number[][]): ImageData {
    const { data, width, height } = imageData;
    const newData = new Uint8ClampedArray(data);
    const kernelSize = kernel.length;
    const offset = Math.floor(kernelSize / 2);

    for (let y = offset; y < height - offset; y++) {
      for (let x = offset; x < width - offset; x++) {
        const idx = (y * width + x) * 4;
        
        if (data[idx + 3] > 0) { // Only process non-transparent pixels
          let minAlpha = 255;
          
          for (let ky = 0; ky < kernelSize; ky++) {
            for (let kx = 0; kx < kernelSize; kx++) {
              if (kernel[ky][kx] === 1) {
                const ny = y + ky - offset;
                const nx = x + kx - offset;
                const nIdx = (ny * width + nx) * 4;
                minAlpha = Math.min(minAlpha, data[nIdx + 3]);
              }
            }
          }
          
          newData[idx + 3] = minAlpha;
        }
      }
    }

    return new ImageData(newData, width, height);
  }

  static dilate(imageData: ImageData, kernel: number[][]): ImageData {
    const { data, width, height } = imageData;
    const newData = new Uint8ClampedArray(data);
    const kernelSize = kernel.length;
    const offset = Math.floor(kernelSize / 2);

    for (let y = offset; y < height - offset; y++) {
      for (let x = offset; x < width - offset; x++) {
        const idx = (y * width + x) * 4;
        let maxAlpha = 0;
        
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            if (kernel[ky][kx] === 1) {
              const ny = y + ky - offset;
              const nx = x + kx - offset;
              const nIdx = (ny * width + nx) * 4;
              maxAlpha = Math.max(maxAlpha, data[nIdx + 3]);
            }
          }
        }
        
        if (maxAlpha > data[idx + 3]) {
          newData[idx + 3] = maxAlpha;
          // Propagate color from the most opaque neighbor
          let bestAlpha = 0;
          let bestR = data[idx], bestG = data[idx + 1], bestB = data[idx + 2];
          
          for (let ky = 0; ky < kernelSize; ky++) {
            for (let kx = 0; kx < kernelSize; kx++) {
              if (kernel[ky][kx] === 1) {
                const ny = y + ky - offset;
                const nx = x + kx - offset;
                const nIdx = (ny * width + nx) * 4;
                if (data[nIdx + 3] > bestAlpha) {
                  bestAlpha = data[nIdx + 3];
                  bestR = data[nIdx];
                  bestG = data[nIdx + 1];
                  bestB = data[nIdx + 2];
                }
              }
            }
          }
          
          newData[idx] = bestR;
          newData[idx + 1] = bestG;
          newData[idx + 2] = bestB;
        }
      }
    }

    return new ImageData(newData, width, height);
  }
}

// Advanced shadow detection and removal
export class ShadowProcessor {
  static detectShadows(imageData: ImageData): Uint8Array {
    const { data, width, height } = imageData;
    const shadowMask = new Uint8Array(width * height);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const pixelIdx = y * width + x;
        
        if (data[idx + 3] < 10) continue; // Skip transparent pixels
        
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Calculate local statistics
        let neighborLumSum = 0, neighborCount = 0;
        let colorVariance = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            if (data[nIdx + 3] > 10) {
              const nLum = 0.299 * data[nIdx] + 0.587 * data[nIdx + 1] + 0.114 * data[nIdx + 2];
              neighborLumSum += nLum;
              neighborCount++;
              
              // Color consistency check
              const colorDiff = Math.abs(r - data[nIdx]) + Math.abs(g - data[nIdx + 1]) + Math.abs(b - data[nIdx + 2]);
              colorVariance += colorDiff;
            }
          }
        }
        
        if (neighborCount > 0) {
          const avgNeighborLum = neighborLumSum / neighborCount;
          const avgColorVariance = colorVariance / neighborCount;
          
          // Shadow detection criteria
          const lumDiff = avgNeighborLum - luminance;
          const saturation = (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(r, g, b, 1);
          
          const isShadow = (
            lumDiff > 20 && // Darker than neighbors
            saturation < 0.3 && // Low saturation
            luminance < 140 && // Not too bright
            avgColorVariance < 60 // Color consistency
          );
          
          shadowMask[pixelIdx] = isShadow ? 255 : 0;
        }
      }
    }
    
    return shadowMask;
  }

  static removeShadows(imageData: ImageData, shadowMask: Uint8Array): ImageData {
    const { data, width, height } = imageData;
    const newData = new Uint8ClampedArray(data);
    
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const idx = (y * width + x) * 4;
        const pixelIdx = y * width + x;
        
        if (shadowMask[pixelIdx] > 128) { // This pixel is in shadow
          // Find non-shadow neighbors to interpolate from
          let sumR = 0, sumG = 0, sumB = 0, validCount = 0;
          let sumLum = 0;
          
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nPixelIdx = (y + dy) * width + (x + dx);
              const nIdx = ((y + dy) * width + (x + dx)) * 4;
              
              if (shadowMask[nPixelIdx] < 128 && data[nIdx + 3] > 10) {
                sumR += data[nIdx];
                sumG += data[nIdx + 1];
                sumB += data[nIdx + 2];
                sumLum += 0.299 * data[nIdx] + 0.587 * data[nIdx + 1] + 0.114 * data[nIdx + 2];
                validCount++;
              }
            }
          }
          
          if (validCount > 0) {
            const avgR = sumR / validCount;
            const avgG = sumG / validCount;
            const avgB = sumB / validCount;
            const avgLum = sumLum / validCount;
            
            const currentLum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            const brightnessFactor = avgLum / Math.max(currentLum, 1);
            const blendFactor = Math.min(0.7, brightnessFactor * 0.3);
            
            newData[idx] = Math.round(data[idx] * (1 - blendFactor) + avgR * blendFactor);
            newData[idx + 1] = Math.round(data[idx + 1] * (1 - blendFactor) + avgG * blendFactor);
            newData[idx + 2] = Math.round(data[idx + 2] * (1 - blendFactor) + avgB * blendFactor);
          }
        }
      }
    }
    
    return new ImageData(newData, width, height);
  }
}

// Advanced reflection detection and removal
export class ReflectionProcessor {
  static detectReflections(imageData: ImageData): Uint8Array {
    const { data, width, height } = imageData;
    const reflectionMask = new Uint8Array(width * height);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const pixelIdx = y * width + x;
        
        if (data[idx + 3] < 10) continue;
        
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        const saturation = (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(r, g, b, 1);
        
        // Calculate neighbor statistics
        let neighborLumSum = 0, neighborSatSum = 0, neighborCount = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            if (data[nIdx + 3] > 10) {
              const nLum = 0.299 * data[nIdx] + 0.587 * data[nIdx + 1] + 0.114 * data[nIdx + 2];
              const nSat = (Math.max(data[nIdx], data[nIdx + 1], data[nIdx + 2]) - 
                           Math.min(data[nIdx], data[nIdx + 1], data[nIdx + 2])) / 
                           Math.max(data[nIdx], data[nIdx + 1], data[nIdx + 2], 1);
              neighborLumSum += nLum;
              neighborSatSum += nSat;
              neighborCount++;
            }
          }
        }
        
        if (neighborCount > 0) {
          const avgNeighborLum = neighborLumSum / neighborCount;
          const avgNeighborSat = neighborSatSum / neighborCount;
          
          // Reflection detection criteria
          const isReflection = (
            luminance > 180 && // Bright
            (saturation < 0.2 || // Low saturation (specular)
             (r > 200 && g > 200 && b > 200)) && // White highlight
            luminance > avgNeighborLum * 1.2 // Much brighter than neighbors
          );
          
          reflectionMask[pixelIdx] = isReflection ? 255 : 0;
        }
      }
    }
    
    return reflectionMask;
  }

  static removeReflections(imageData: ImageData, reflectionMask: Uint8Array): ImageData {
    const { data, width, height } = imageData;
    const newData = new Uint8ClampedArray(data);
    
    for (let y = 3; y < height - 3; y++) {
      for (let x = 3; x < width - 3; x++) {
        const idx = (y * width + x) * 4;
        const pixelIdx = y * width + x;
        
        if (reflectionMask[pixelIdx] > 128) { // This pixel is a reflection
          // Use texture synthesis approach - find similar patterns nearby
          let bestR = data[idx], bestG = data[idx + 1], bestB = data[idx + 2];
          let bestMatch = Infinity;
          
          // Search in a larger radius for similar texture
          for (let dy = -3; dy <= 3; dy++) {
            for (let dx = -3; dx <= 3; dx++) {
              if (Math.abs(dx) + Math.abs(dy) < 2) continue; // Skip immediate neighbors
              
              const candidatePixelIdx = (y + dy) * width + (x + dx);
              const candidateIdx = ((y + dy) * width + (x + dx)) * 4;
              
              if (reflectionMask[candidatePixelIdx] < 64 && data[candidateIdx + 3] > 10) {
                // Calculate pattern similarity around this candidate
                let similarity = 0;
                let sampleCount = 0;
                
                for (let sy = -1; sy <= 1; sy++) {
                  for (let sx = -1; sx <= 1; sx++) {
                    const sourceIdx = ((y + sy) * width + (x + sx)) * 4;
                    const targetIdx = ((y + dy + sy) * width + (x + dx + sx)) * 4;
                    
                    if (data[sourceIdx + 3] > 10 && data[targetIdx + 3] > 10) {
                      const colorDiff = Math.abs(data[sourceIdx] - data[targetIdx]) +
                                       Math.abs(data[sourceIdx + 1] - data[targetIdx + 1]) +
                                       Math.abs(data[sourceIdx + 2] - data[targetIdx + 2]);
                      similarity += colorDiff;
                      sampleCount++;
                    }
                  }
                }
                
                if (sampleCount > 0) {
                  const avgSimilarity = similarity / sampleCount;
                  if (avgSimilarity < bestMatch) {
                    bestMatch = avgSimilarity;
                    bestR = data[candidateIdx];
                    bestG = data[candidateIdx + 1];
                    bestB = data[candidateIdx + 2];
                  }
                }
              }
            }
          }
          
          // Blend the found color with some original to maintain naturalness
          const blendFactor = 0.8;
          newData[idx] = Math.round(data[idx] * (1 - blendFactor) + bestR * blendFactor);
          newData[idx + 1] = Math.round(data[idx + 1] * (1 - blendFactor) + bestG * blendFactor);
          newData[idx + 2] = Math.round(data[idx + 2] * (1 - blendFactor) + bestB * blendFactor);
        }
      }
    }
    
    return new ImageData(newData, width, height);
  }
}

// Main processing pipeline
export async function processImageAdvanced(
  imageBlob: Blob, 
  options: ProcessingOptions = DEFAULT_OPTIONS
): Promise<Blob> {
  const img = await createImageBitmap(imageBlob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Step 1: Shadow removal
  if (options.shadowRemoval) {
    const shadowMask = ShadowProcessor.detectShadows(imageData);
    imageData = ShadowProcessor.removeShadows(imageData, shadowMask);
  }

  // Step 2: Reflection removal
  if (options.reflectionRemoval) {
    const reflectionMask = ReflectionProcessor.detectReflections(imageData);
    imageData = ReflectionProcessor.removeReflections(imageData, reflectionMask);
  }

  // Step 3: Edge smoothing using morphological operations
  if (options.edgeSmoothing) {
    const kernel = MorphologyProcessor.createKernel(3, 'circle');
    imageData = MorphologyProcessor.erode(imageData, kernel);
    imageData = MorphologyProcessor.dilate(imageData, kernel);
  }

  // Step 4: Color correction
  if (options.colorCorrection) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 10) {
        // Subtle contrast enhancement
        const r = Math.min(255, Math.max(0, (data[i] - 128) * 1.05 + 128));
        const g = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.05 + 128));
        const b = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.05 + 128));
        
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
    }
  }

  // Apply the processed data
  ctx.putImageData(imageData, 0, 0);

  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => b && resolve(b), 'image/png')
  );
}