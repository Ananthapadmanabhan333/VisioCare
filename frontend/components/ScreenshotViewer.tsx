"use client";

import React, { useState } from 'react';
import { ShieldAlert, Maximize2, Zap } from 'lucide-react';

interface BoundingBox {
  label: string;
  coords: [number, number, number, number]; // [ymin, xmin, ymax, xmax] as percentages
}

interface ScreenshotViewerProps {
  imageUrl: string;
  boxes?: BoundingBox[];
  isScanning?: boolean;
}

export default function ScreenshotViewer({ imageUrl, boxes = [], isScanning = false }: ScreenshotViewerProps) {
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);

  return (
    <div className="relative border border-borderGlow bg-[#0c101b] rounded-2xl overflow-hidden aspect-video max-w-4xl mx-auto shadow-2xl flex items-center justify-center group">
      
      {/* 1. Underlying Diagnostic Image */}
      {imageUrl ? (
        <img 
          src={imageUrl.startsWith("http") || imageUrl.startsWith("/") ? imageUrl : `http://127.0.0.1:8000${imageUrl}`} 
          alt="System Support Diagnostic Screenshot" 
          className="w-full h-full object-contain max-h-[460px] select-none"
        />
      ) : (
        <div className="text-gray-500 font-mono text-xs flex flex-col items-center gap-3 py-20">
          <ShieldAlert className="h-8 w-8 text-gray-600 stroke-[1.5]" />
          <span>Waiting for visual hardware upload...</span>
        </div>
      )}

      {/* 2. Scanning Laser Animation Overlay */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute left-0 right-0 h-[2px] scanner-laser shadow-glow" />
          <div className="absolute inset-0 bg-primary/5 animate-pulse" />
        </div>
      )}

      {/* 3. Bounding Boxes Overlays */}
      {!isScanning && boxes.map((box, idx) => {
        const [ymin, xmin, ymax, xmax] = box.coords;
        const width = xmax - xmin;
        const height = ymax - ymin;
        
        return (
          <div
            key={idx}
            className={`absolute border-2 transition-all duration-300 ${
              hoveredBox === idx 
                ? "border-primary bg-primary/10 shadow-glow z-20 scale-[1.01]" 
                : "border-secondary/60 bg-secondary/5 z-10"
            }`}
            style={{
              top: `${ymin}%`,
              left: `${xmin}%`,
              width: `${width}%`,
              height: `${height}%`
            }}
            onMouseEnter={() => setHoveredBox(idx)}
            onMouseLeave={() => setHoveredBox(null)}
          >
            {/* Box Header Label */}
            <span className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider transition-colors duration-200 ${
              hoveredBox === idx 
                ? "bg-primary text-black" 
                : "bg-secondary text-white"
            }`}>
              {box.label}
            </span>
          </div>
        );
      })}

      {/* 4. Action Bar Badge */}
      {boxes.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-background/90 border border-borderGlow backdrop-blur px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-mono text-gray-400">
          <Zap className="h-3 w-3 text-primary stroke-[2]" />
          <span>VLM detected {boxes.length} active anomalies</span>
        </div>
      )}
    </div>
  );
}
