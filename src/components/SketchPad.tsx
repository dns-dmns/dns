import React, { useState, useEffect, useRef } from 'react';
import { 
  Square, 
  Circle as CircleIcon, 
  Slash, 
  Edit3, 
  Type, 
  Trash2, 
  Download, 
  Grid, 
  Undo2, 
  Redo2, 
  Sparkles, 
  Save, 
  FolderOpen,
  Maximize2,
  Calendar,
  Grid3X3,
  MousePointerClick,
  Check,
  Eye,
  EyeOff,
  Plus,
  ZoomIn,
  ZoomOut,
  Settings,
  Compass,
  Ruler
} from 'lucide-react';

interface SavedSketch {
  id: string;
  name: string;
  date: string;
  thumbnail: string; // Base64 image
  drawingDataUrl?: string; // Raw sketch layer without grid/blueprint background
  notes?: string;
  widthFeet?: number;
  lengthFeet?: number;
  totalSqft?: number;
  uom?: 'ft' | 'in';
  scaleEnabled?: boolean;
}

interface PlacedScale {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

function distanceToSegment(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
}

export default function SketchPad() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null); // For rendering persistent grids or blueprints
  const loadedDrawingRef = useRef<string | null>(null);
  
  // Land & Scale Configuration state
  const [landConfig, setLandConfig] = useState<{
    widthFeet: number;
    lengthFeet: number;
    totalSqft: number;
    isConfigured: boolean;
    uom: 'ft' | 'in';
    scaleEnabled: boolean;
  }>({
    widthFeet: 60,
    lengthFeet: 40,
    totalSqft: 2400,
    isConfigured: false, // Default to false so user has to configure width & length first
    uom: 'ft',
    scaleEnabled: true,
  });

  // Wizard form temp states
  const [tempWidth, setTempWidth] = useState<number>(60);
  const [tempLength, setTempLength] = useState<number>(40);
  const [tempPreset, setTempPreset] = useState<string>('40x60');
  const [tempUom, setTempUom] = useState<'ft' | 'in'>('ft');
  const [tempScaleEnabled, setTempScaleEnabled] = useState<boolean>(true);

  // Placed scale measurements state
  const [placedScales, setPlacedScales] = useState<PlacedScale[]>([]);
  const [selectedScaleId, setSelectedScaleId] = useState<string | null>(null);
  const [allowScalePlacement, setAllowScalePlacement] = useState<boolean>(false);
  const [lastTemporaryMeasure, setLastTemporaryMeasure] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);

  // Zooming controls state
  const [zoom, setZoom] = useState<number>(1.0);
  const lastCoords = useRef({ x: 0, y: 0 });

  // Drawing state
  const [tool, setTool] = useState<'pencil' | 'line' | 'rect' | 'circle' | 'text' | 'measure'>('pencil');
  const [color, setColor] = useState<string>('#1D1D1F');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [bgPreset, setBgPreset] = useState<'grid' | 'dots' | 'blueprint' | 'plain'>('grid');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [textLabel, setTextLabel] = useState<string>('Plot A');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [orthogonalLock, setOrthogonalLock] = useState<boolean>(false);
  const [textRotation, setTextRotation] = useState<number>(0);
  
  // Undo/Redo & History Management
  const [history, setHistory] = useState<string[]>([]); // Array of base64 states
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [loadTargetSketch, setLoadTargetSketch] = useState<SavedSketch | null>(null);
  
  // Gallery & UI state
  const [savedSketches, setSavedSketches] = useState<SavedSketch[]>([]);
  const [sketchName, setSketchName] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showGallery, setShowGallery] = useState<boolean>(true);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 500 });
  
  // Start position for shapes
  const startPos = useRef({ x: 0, y: 0 });
  const [activeInstruction, setActiveInstruction] = useState<string>('Click and drag to sketch freeform paths.');

  // Colors list
  const colors = [
    { value: '#1D1D1F', label: 'Charcoal Black' },
    { value: '#2563EB', label: 'Royal Blue' },
    { value: '#10B981', label: 'Emerald Green' },
    { value: '#EF4444', label: 'Crimson Red' },
    { value: '#F59E0B', label: 'Amber Yellow' },
    { value: '#8B5CF6', label: 'Orchid Purple' },
    { value: '#EC4899', label: 'Rose Pink' },
  ];

  // Instructions helper
  useEffect(() => {
    switch (tool) {
      case 'pencil':
        setActiveInstruction('Freehand Drawing: Press & drag to trace paths. Excellent for natural terrain, trees or water.');
        break;
      case 'line':
        setActiveInstruction(`Straight Line Tool: Drag from start to finish. ${snapToGrid ? 'Snapping to nearest 20px grid point.' : 'Hold Shift key for straight angle lines.'}`);
        break;
      case 'rect':
        setActiveInstruction(`Rectangle Boundary: Draw plots, houses, or zones. ${snapToGrid ? 'Snapping dimensions to nearest 20px grid line.' : ''}`);
        break;
      case 'circle':
        setActiveInstruction('Circular Boundary: Perfect for plotting wells, round towers, or layout centerpieces.');
        break;
      case 'text':
        setActiveInstruction(`Text Stamp: Type label on sidebar, then CLICK on the canvas where you want to place '${textLabel}'.`);
        break;
      case 'measure':
        setActiveInstruction('Scale / Measure: Drag to draw a persistent CAD-style scale dimension line on the canvas.');
        break;
    }
  }, [tool, snapToGrid, textLabel]);

  // Handle canvas sizing using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        // Make height dynamic based on width but keep comfortable ratios
        const calculatedWidth = Math.max(500, Math.floor(width));
        const calculatedHeight = Math.min(600, Math.max(380, Math.floor(calculatedWidth * 0.58)));
        
        setCanvasDimensions({
          width: calculatedWidth,
          height: calculatedHeight
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const drawOverlays = (ctx: CanvasRenderingContext2D) => {
    const scaleMarginMultiplier = 1.4;
    const simulatedWorldWidthFeet = landConfig.widthFeet * scaleMarginMultiplier;
    const currentPixelsPerFoot = canvasDimensions.width / simulatedWorldWidthFeet;

    // Draw placed scales
    placedScales.forEach((scale) => {
      const isSelected = scale.id === selectedScaleId;
      const strokeColor = isSelected ? '#EF4444' : '#D97706';
      const strokeWidth = isSelected ? 3.0 : 1.8;
      renderPlacedScale(ctx, scale.start, scale.end, strokeColor, strokeWidth, currentPixelsPerFoot);
    });

    // Draw last temporary measure if active and tool is measure and not currently dragging
    if (lastTemporaryMeasure && tool === 'measure' && !isDrawing) {
      renderPlacedScale(ctx, lastTemporaryMeasure.start, lastTemporaryMeasure.end, 'rgba(217, 119, 6, 0.65)', 1.8, currentPixelsPerFoot, true);
    }
  };

  // Set up high-DPI scaling whenever dimensions change, bgPreset changes, or landConfig changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    const ctx = canvas.getContext('2d');
    const bgCtx = bgCanvas.getContext('2d');
    if (!ctx || !bgCtx) return;

    // Get the device pixel ratio, falling back to 1.
    const dpr = window.devicePixelRatio || 1;
    // Set a high-resolution backing scale multiplier (3x logical coordinates)
    // so drawings and grids remain razor sharp even at 3x zoom!
    const backingScale = dpr * 3;

    // Set the canvas coordinate system backing store (NOT dependent on zoom to avoid re-rasterizing blur)
    canvas.width = canvasDimensions.width * backingScale;
    canvas.height = canvasDimensions.height * backingScale;
    bgCanvas.width = canvasDimensions.width * backingScale;
    bgCanvas.height = canvasDimensions.height * backingScale;

    // Normalize coordinates to standard logical space
    ctx.scale(backingScale, backingScale);
    bgCtx.scale(backingScale, backingScale);

    // Redraw grids and background
    drawBackground();

    // Reapply the current drawing state from the last history index if available
    if (loadedDrawingRef.current) {
      const img = new Image();
      img.src = loadedDrawingRef.current;
      img.onload = () => {
        ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
        ctx.drawImage(img, 0, 0, canvasDimensions.width, canvasDimensions.height);
        drawOverlays(ctx);
        const loadedState = canvas.toDataURL();
        setHistory([loadedState]);
        setHistoryIndex(0);
        loadedDrawingRef.current = null;
      };
    } else if (history.length > 0 && historyIndex >= 0) {
      const img = new Image();
      img.src = history[historyIndex];
      img.onload = () => {
        ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
        ctx.drawImage(img, 0, 0, canvasDimensions.width, canvasDimensions.height);
        drawOverlays(ctx);
      };
    } else {
      ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
      // Save initial blank state
      const blankState = canvas.toDataURL();
      setHistory([blankState]);
      setHistoryIndex(0);
    }
  }, [canvasDimensions, bgPreset, landConfig]);

  // Reactive overlay redraw side-effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (history.length > 0 && historyIndex >= 0) {
      const img = new Image();
      img.src = history[historyIndex];
      img.onload = () => {
        ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
        ctx.drawImage(img, 0, 0, canvasDimensions.width, canvasDimensions.height);
        drawOverlays(ctx);
      };
    }
  }, [placedScales, selectedScaleId, lastTemporaryMeasure, tool, isDrawing, historyIndex, history]);

  // Load Saved Sketches from LocalStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dmns_land_sketches');
    if (stored) {
      try {
        setSavedSketches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load saved sketches', e);
      }
    }
  }, []);

  const drawBackground = () => {
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    const width = canvasDimensions.width;
    const height = canvasDimensions.height;

    ctx.clearRect(0, 0, width, height);

    // If land size is not yet configured, draw a standard subtle grid
    if (!landConfig.isConfigured) {
      ctx.fillStyle = '#FCFCFD';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 0.8;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      return;
    }

    // Scaling Factor: map real-world units into canvas pixels
    // Let's include +40% margin on the outer bounds of the property for neighbors & setbacks
    const scaleMarginMultiplier = 1.4;
    const simulatedWorldWidthUnits = landConfig.widthFeet * scaleMarginMultiplier;
    const pixelsPerFoot = width / simulatedWorldWidthUnits;

    const rectWidth = landConfig.widthFeet * pixelsPerFoot;
    const rectHeight = landConfig.lengthFeet * pixelsPerFoot;
    const offsetX = (width - rectWidth) / 2;
    const offsetY = (height - rectHeight) / 2;

    // Background color for extra board area (margins outside the actual land parcel)
    if (bgPreset === 'blueprint') {
      ctx.fillStyle = '#0F172A'; // Dark slate-black outer margin
      ctx.fillRect(0, 0, width, height);

      // Light slate blueprint interior parcel
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(offsetX, offsetY, rectWidth, rectHeight);
    } else if (bgPreset === 'grid' || bgPreset === 'dots') {
      ctx.fillStyle = '#F8FAFC'; // Clean zinc outer margins
      ctx.fillRect(0, 0, width, height);

      // Pure white interior parcel
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(offsetX, offsetY, rectWidth, rectHeight);
    } else {
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(offsetX, offsetY, rectWidth, rectHeight);
    }

    // Set grid spacing (e.g., lines every 5 units or 10 units depending on land size)
    let unitSpacing = 10;
    if (landConfig.uom === 'in') {
      if (landConfig.widthFeet < 120) {
        unitSpacing = 12; // 1 foot grid spacing for small plans
      } else if (landConfig.widthFeet < 500) {
        unitSpacing = 50;
      } else if (landConfig.widthFeet > 2000) {
        unitSpacing = 200;
      } else {
        unitSpacing = 100;
      }
    } else {
      if (landConfig.widthFeet < 50) {
        unitSpacing = 5;
      } else if (landConfig.widthFeet > 200) {
        unitSpacing = 20;
      }
    }
    const pixelSpacing = unitSpacing * pixelsPerFoot;

    ctx.save();

    // Configure grid lines
    if (bgPreset === 'blueprint') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 0.5;
    } else {
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
      ctx.lineWidth = 0.5;
    }

    if (bgPreset === 'grid' || bgPreset === 'blueprint') {
      // Draw grid lines starting from the parcel boundary
      // Vertical grid lines (left of boundary and right of boundary)
      for (let x = offsetX; x >= 0; x -= pixelSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let x = offsetX; x < width; x += pixelSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = offsetY; y >= 0; y -= pixelSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      for (let y = offsetY; y < height; y += pixelSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Major grids (every 5 grid blocks)
      if (bgPreset === 'blueprint') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 0.8;
      } else {
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
        ctx.lineWidth = 0.8;
      }
      const majorSpacing = pixelSpacing * 5;
      for (let x = offsetX; x >= 0; x -= majorSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let x = offsetX; x < width; x += majorSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = offsetY; y >= 0; y -= majorSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      for (let y = offsetY; y < height; y += majorSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
    } else if (bgPreset === 'dots') {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      for (let x = offsetX; x >= 0; x -= pixelSpacing) {
        for (let y = offsetY; y >= 0; y -= pixelSpacing) {
          ctx.beginPath(); ctx.arc(x, y, 1.2, 0, 2 * Math.PI); ctx.fill();
        }
        for (let y = offsetY + pixelSpacing; y < height; y += pixelSpacing) {
          ctx.beginPath(); ctx.arc(x, y, 1.2, 0, 2 * Math.PI); ctx.fill();
        }
      }
      for (let x = offsetX + pixelSpacing; x < width; x += pixelSpacing) {
        for (let y = offsetY; y >= 0; y -= pixelSpacing) {
          ctx.beginPath(); ctx.arc(x, y, 1.2, 0, 2 * Math.PI); ctx.fill();
        }
        for (let y = offsetY + pixelSpacing; y < height; y += pixelSpacing) {
          ctx.beginPath(); ctx.arc(x, y, 1.2, 0, 2 * Math.PI); ctx.fill();
        }
      }
    }

    ctx.restore();

    // Draw the main Property Boundary Box
    ctx.save();
    ctx.strokeStyle = '#2563EB'; // Royal Blue boundary line
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 4]); // Clean dashes
    ctx.strokeRect(offsetX, offsetY, rectWidth, rectHeight);
    ctx.restore();

    // Draw precise visual dimension rules/lines
    ctx.save();
    ctx.fillStyle = bgPreset === 'blueprint' ? '#94A3B8' : '#64748B';
    ctx.strokeStyle = bgPreset === 'blueprint' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
    ctx.font = 'bold 10px monospace';
    ctx.lineWidth = 1;

    // Top Dimension Line (Width)
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY - 14);
    ctx.lineTo(offsetX + rectWidth, offsetY - 14);
    // Left & Right tick lines
    ctx.moveTo(offsetX, offsetY - 20); ctx.lineTo(offsetX, offsetY - 8);
    ctx.moveTo(offsetX + rectWidth, offsetY - 20); ctx.lineTo(offsetX + rectWidth, offsetY - 8);
    ctx.stroke();
    const widthText = `${landConfig.widthFeet} ${landConfig.uom || 'ft'}`;
    const wTextWidth = ctx.measureText(widthText).width;
    ctx.fillStyle = bgPreset === 'blueprint' ? '#1E293B' : '#FFFFFF';
    ctx.fillRect(offsetX + rectWidth / 2 - wTextWidth / 2 - 4, offsetY - 21, wTextWidth + 8, 14);
    ctx.fillStyle = bgPreset === 'blueprint' ? '#60A5FA' : '#2563EB';
    ctx.fillText(widthText, offsetX + rectWidth / 2 - wTextWidth / 2, offsetY - 11);

    // Left Dimension Line (Length)
    ctx.beginPath();
    ctx.moveTo(offsetX - 14, offsetY);
    ctx.lineTo(offsetX - 14, offsetY + rectHeight);
    // Top & Bottom tick lines
    ctx.moveTo(offsetX - 20, offsetY); ctx.lineTo(offsetX - 8, offsetY);
    ctx.moveTo(offsetX - 20, offsetY + rectHeight); ctx.lineTo(offsetX - 8, offsetY + rectHeight);
    ctx.stroke();
    const heightText = `${landConfig.lengthFeet} ${landConfig.uom || 'ft'}`;
    const hTextWidth = ctx.measureText(heightText).width;
    ctx.save();
    ctx.translate(offsetX - 22, offsetY + rectHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = bgPreset === 'blueprint' ? '#1E293B' : '#FFFFFF';
    ctx.fillRect(-hTextWidth / 2 - 4, -7, hTextWidth + 8, 14);
    ctx.fillStyle = bgPreset === 'blueprint' ? '#60A5FA' : '#2563EB';
    ctx.fillText(heightText, -hTextWidth / 2, 3);
    ctx.restore();

    // Draft labels watermark
    ctx.fillStyle = bgPreset === 'blueprint' ? 'rgba(255,255,255,0.12)' : 'rgba(37,99,235,0.06)';
    ctx.font = '900 12px "Inter", sans-serif';
    ctx.fillText(`PROPERTY PARCEL: ${landConfig.totalSqft.toLocaleString('en-IN')} ${landConfig.uom === 'in' ? 'SQIN' : 'SQFT'}`, offsetX + 15, offsetY + 25);
    ctx.font = '500 10px "Inter", sans-serif';
    ctx.fillText('LAYOUT MODEL SHEET', offsetX + 15, offsetY + 40);

    ctx.restore();
  };

  const renderPlacedScale = (
    ctx: CanvasRenderingContext2D,
    start: { x: number; y: number },
    end: { x: number; y: number },
    strokeColor: string,
    strokeWidth: number,
    pixelsPerFoot: number,
    isTemporary: boolean = false
  ) => {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distPixels = Math.sqrt(dx * dx + dy * dy);
    const distUnits = distPixels / pixelsPerFoot;
    
    if (distPixels > 5) {
      const angle = Math.atan2(dy, dx);
      const perpAngle = angle + Math.PI / 2;
      const tickLen = 6;
      
      // Perpendicular end ticks
      ctx.beginPath();
      ctx.moveTo(start.x - Math.cos(perpAngle) * tickLen, start.y - Math.sin(perpAngle) * tickLen);
      ctx.lineTo(start.x + Math.cos(perpAngle) * tickLen, start.y + Math.sin(perpAngle) * tickLen);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(end.x - Math.cos(perpAngle) * tickLen, end.y - Math.sin(perpAngle) * tickLen);
      ctx.lineTo(end.x + Math.cos(perpAngle) * tickLen, end.y + Math.sin(perpAngle) * tickLen);
      ctx.stroke();

      const labelText = `${isTemporary ? '⚡ ' : '↔ '}${distUnits.toFixed(1)} ft`;
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      
      ctx.save();
      ctx.translate(midX, midY);
      let textAngle = angle;
      if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
        textAngle += Math.PI;
      }
      ctx.rotate(textAngle);

      ctx.font = 'bold 11px monospace, "JetBrains Mono", sans-serif';
      const textWidth = ctx.measureText(labelText).width;

      // Draw pill backdrop
      ctx.fillStyle = isTemporary ? '#FEF3C7' : strokeColor === '#EF4444' ? '#FEE2E2' : '#FFFBEB';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-textWidth / 2 - 5, -8, textWidth + 10, 16, 4);
      } else {
        ctx.rect(-textWidth / 2 - 5, -8, textWidth + 10, 16);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = strokeColor === '#EF4444' ? '#991B1B' : '#B45309';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  };

  const renderShape = (
    ctx: CanvasRenderingContext2D,
    start: { x: number; y: number },
    end: { x: number; y: number },
    selectedTool: string,
    strokeColor: string,
    strokeWidth: number,
    pixelsPerFoot: number
  ) => {
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = `${strokeColor}1D`; // Semi-transparent shape body
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const currentUom = landConfig.uom || 'ft';

    if (selectedTool === 'line') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Calculate length in units
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distPixels = Math.sqrt(dx * dx + dy * dy);
      const distUnits = distPixels / pixelsPerFoot;

      if (distPixels > 10) {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const angle = Math.atan2(dy, dx);

        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(angle);

        const text = `${Math.round(distUnits)} ${currentUom}`;
        ctx.font = 'bold 11px monospace, "JetBrains Mono", sans-serif';
        const textWidth = ctx.measureText(text).width;

        // Draw opaque backdrop pill for text readability
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // Draw standard rounded rect safely
        if (ctx.roundRect) {
          ctx.roundRect(-textWidth / 2 - 5, -19, textWidth + 10, 16, 3);
        } else {
          ctx.rect(-textWidth / 2 - 5, -19, textWidth + 10, 16);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = strokeColor;
        ctx.fillText(text, -textWidth / 2, -7);
        ctx.restore();
      }
    } else if (selectedTool === 'rect') {
      const w = end.x - start.x;
      const h = end.y - start.y;
      ctx.beginPath();
      ctx.rect(start.x, start.y, w, h);
      ctx.fill();
      ctx.stroke();

      const wUnits = Math.abs(w) / pixelsPerFoot;
      const hUnits = Math.abs(h) / pixelsPerFoot;

      if (Math.abs(w) > 35 && Math.abs(h) > 35) {
        const sizeLabel = `${Math.round(wUnits)} ${currentUom} × ${Math.round(hUnits)} ${currentUom}`;
        ctx.font = 'bold 10px monospace, "JetBrains Mono"';
        const labelWidth = ctx.measureText(sizeLabel).width;

        const midX = start.x + w / 2;
        const midY = start.y + h / 2;

        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(midX - labelWidth / 2 - 5, midY - 10, labelWidth + 10, 16, 3);
        } else {
          ctx.rect(midX - labelWidth / 2 - 5, midY - 10, labelWidth + 10, 16);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1D1D1F';
        ctx.fillText(sizeLabel, midX - labelWidth / 2, midY + 2);
        ctx.restore();
      }
    } else if (selectedTool === 'circle') {
      const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      ctx.beginPath();
      ctx.arc(start.x, start.y, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      const rUnits = r / pixelsPerFoot;
      if (r > 15) {
        const sizeLabel = `r=${Math.round(rUnits)} ${currentUom}`;
        ctx.font = 'bold 9px monospace, "JetBrains Mono"';
        const labelWidth = ctx.measureText(sizeLabel).width;

        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(start.x - labelWidth / 2 - 4, start.y - 7, labelWidth + 8, 14, 2);
        } else {
          ctx.rect(start.x - labelWidth / 2 - 4, start.y - 7, labelWidth + 8, 14);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1D1D1F';
        ctx.fillText(sizeLabel, start.x - labelWidth / 2, start.y + 3);
        ctx.restore();
      }
    } else if (selectedTool === 'measure') {
      // CAD-style Amber Scale Measurement / Dimension Tool
      ctx.strokeStyle = '#D97706';
      ctx.fillStyle = '#D97706';
      ctx.lineWidth = 1.8;
      
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distPixels = Math.sqrt(dx * dx + dy * dy);
      const distUnits = distPixels / pixelsPerFoot;
      
      if (distPixels > 5) {
        const angle = Math.atan2(dy, dx);
        const perpAngle = angle + Math.PI / 2;
        const tickLen = 6;
        
        // Perpendicular end ticks
        ctx.beginPath();
        ctx.moveTo(start.x - Math.cos(perpAngle) * tickLen, start.y - Math.sin(perpAngle) * tickLen);
        ctx.lineTo(start.x + Math.cos(perpAngle) * tickLen, start.y + Math.sin(perpAngle) * tickLen);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(end.x - Math.cos(perpAngle) * tickLen, end.y - Math.sin(perpAngle) * tickLen);
        ctx.lineTo(end.x + Math.cos(perpAngle) * tickLen, end.y + Math.sin(perpAngle) * tickLen);
        ctx.stroke();

        const labelText = `↔ ${distUnits.toFixed(1)} ${currentUom}`;
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        ctx.save();
        ctx.translate(midX, midY);
        let textAngle = angle;
        if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
          textAngle += Math.PI;
        }
        ctx.rotate(textAngle);

        ctx.font = 'bold 11px monospace, "JetBrains Mono", sans-serif';
        const textWidth = ctx.measureText(labelText).width;

        // Draw pill backdrop
        ctx.fillStyle = '#FFFBEB';
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-textWidth / 2 - 5, -8, textWidth + 10, 16, 4);
        } else {
          ctx.rect(-textWidth / 2 - 5, -8, textWidth + 10, 16);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#B45309';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, 0, 0);
        ctx.restore();
      }
    }
  };

  // Helper to obtain local coordinates adjusted for DPR and canvas location
  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    // Support touch
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    // Apply zoom compensation for scale transform
    let x = (clientX - rect.left) / zoom;
    let y = (clientY - rect.top) / zoom;

    // Apply Snapping
    if (snapToGrid) {
      x = Math.round(x / 20) * 20;
      y = Math.round(y / 20) * 20;
    }

    return { x, y };
  };

  const startDrawing = (e: any) => {
    const coords = getCoordinates(e);

    // If the tool is 'measure', let's check if the click is near an existing scale measurement.
    if (tool === 'measure') {
      const scaleMarginMultiplier = 1.4;
      const simulatedWorldWidthFeet = landConfig.widthFeet * scaleMarginMultiplier;
      const currentPixelsPerFoot = canvasDimensions.width / simulatedWorldWidthFeet;

      const clickedScale = placedScales.find((scale) => {
        const dist = distanceToSegment(coords, scale.start, scale.end);
        return dist < 15; // Within 15 logical pixels
      });

      if (clickedScale) {
        setSelectedScaleId(clickedScale.id);
        setIsDrawing(false);
        return;
      } else {
        setSelectedScaleId(null);
      }
    }

    setIsDrawing(true);
    startPos.current = coords;
    lastCoords.current = coords;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pencil') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (tool === 'text') {
      // Direct stamp on click
      ctx.save();
      ctx.translate(coords.x, coords.y);
      const rad = (textRotation * Math.PI) / 180;
      ctx.rotate(rad);
      ctx.font = `bold ${Math.max(12, lineWidth * 4)}px Inter, sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(textLabel, 0, 0);
      ctx.restore();
      setIsDrawing(false);
      pushHistory();
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (tool === 'line' && (orthogonalLock || e.shiftKey)) {
      const dx = coords.x - startPos.current.x;
      const dy = coords.y - startPos.current.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        coords.y = startPos.current.y;
      } else {
        coords.x = startPos.current.x;
      }
    }
    lastCoords.current = coords;

    if (tool === 'pencil') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else {
      // For shapes (line, rect, circle, measure), we must clear the current draw action state
      // and draw the current shape over the state at historyIndex, PLUS all overlays!
      const img = new Image();
      img.src = history[historyIndex];
      img.onload = () => {
        ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
        ctx.drawImage(img, 0, 0, canvasDimensions.width, canvasDimensions.height);
        
        const scaleMarginMultiplier = 1.4;
        const simulatedWorldWidthFeet = landConfig.widthFeet * scaleMarginMultiplier;
        const currentPixelsPerFoot = canvasDimensions.width / simulatedWorldWidthFeet;

        // Draw dynamic placed scales
        placedScales.forEach((scale) => {
          const isSelected = scale.id === selectedScaleId;
          const strokeColor = isSelected ? '#EF4444' : '#D97706';
          const strokeWidth = isSelected ? 3.0 : 1.8;
          renderPlacedScale(ctx, scale.start, scale.end, strokeColor, strokeWidth, currentPixelsPerFoot);
        });

        // Draw current preview shape
        renderShape(ctx, startPos.current, coords, tool, color, lineWidth, currentPixelsPerFoot);
      };
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Special logic for measurement tool: do not bake pixels directly. Store vector elements instead.
    if (tool === 'measure') {
      const dx = lastCoords.current.x - startPos.current.x;
      const dy = lastCoords.current.y - startPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 5) {
        const newCoords = { start: { ...startPos.current }, end: { ...lastCoords.current } };
        if (allowScalePlacement) {
          const scaleObj = {
            id: `scale_${Date.now()}`,
            start: { ...startPos.current },
            end: { ...lastCoords.current }
          };
          setPlacedScales(prev => [...prev, scaleObj]);
          setLastTemporaryMeasure(null);
        } else {
          setLastTemporaryMeasure(newCoords);
        }
      }
      return;
    }

    // For other shapes (line, rect, circle), bake them synchronously on stopDrawing to ensure they are captured in the history data URL
    if (tool !== 'pencil' && tool !== 'text') {
      const scaleMarginMultiplier = 1.4;
      const simulatedWorldWidthFeet = landConfig.widthFeet * scaleMarginMultiplier;
      const currentPixelsPerFoot = canvasDimensions.width / simulatedWorldWidthFeet;

      const img = new Image();
      img.src = history[historyIndex];
      img.onload = () => {
        ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
        ctx.drawImage(img, 0, 0, canvasDimensions.width, canvasDimensions.height);
        
        // Render final shape synchronously with measurement tags
        renderShape(ctx, startPos.current, lastCoords.current, tool, color, lineWidth, currentPixelsPerFoot);
        
        // Push this state to history
        const state = canvas.toDataURL();
        const newHistory = history.slice(0, historyIndex + 1);
        const updated = [...newHistory, state];
        setHistory(updated);
        setHistoryIndex(updated.length - 1);
      };
      return;
    }

    pushHistory();
  };

  const pushHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const state = canvas.toDataURL();
    
    // Slice forward history if we were in middle of undo stack
    const newHistory = history.slice(0, historyIndex + 1);
    const updated = [...newHistory, state];
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      loadHistoryIndex(prevIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      loadHistoryIndex(nextIndex);
    }
  };

  const loadHistoryIndex = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = history[index];
    img.onload = () => {
      ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
      ctx.drawImage(img, 0, 0, canvasDimensions.width, canvasDimensions.height);
    };
  };

  const clearCanvas = () => {
    setShowClearConfirm(true);
  };

  const executeClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    pushHistory();
    setShowClearConfirm(false);
  };

  const getCombinedImageDataUrl = (): string => {
    const bgCanvas = bgCanvasRef.current;
    const canvas = canvasRef.current;
    if (!bgCanvas || !canvas) return '';

    // We combine the high-DPI grid/marking background + the user drawing into a single export canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = bgCanvas.width;
    exportCanvas.height = bgCanvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return '';

    // Draw the high-res background including property boundaries, grids, setbacks, and dimensions
    ctx.drawImage(bgCanvas, 0, 0);

    // Overlay user's sketch drawing layer on top
    ctx.drawImage(canvas, 0, 0);

    return exportCanvas.toDataURL('image/png');
  };

  const downloadSketch = () => {
    const dataUrl = getCombinedImageDataUrl();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `plot-layout-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const saveToGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sketchName.trim()) return;

    const thumbnail = getCombinedImageDataUrl();
    const canvas = canvasRef.current;
    const drawingDataUrl = canvas ? canvas.toDataURL() : '';

    const newSketch: SavedSketch = {
      id: `sketch_${Date.now()}`,
      name: sketchName.trim(),
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      thumbnail,
      drawingDataUrl,
      notes: `Parcel Size: ${landConfig.scaleEnabled ? `${landConfig.widthFeet} × ${landConfig.lengthFeet} ${landConfig.uom || 'ft'}` : 'Infinite Grid'} (${landConfig.scaleEnabled ? `${landConfig.totalSqft.toLocaleString('en-IN')} ${landConfig.uom === 'in' ? 'sqin' : 'sqft'}` : 'Custom Sketch'}), Grid: ${bgPreset.toUpperCase()}`,
      widthFeet: landConfig.widthFeet,
      lengthFeet: landConfig.lengthFeet,
      totalSqft: landConfig.totalSqft,
      uom: landConfig.uom || 'ft',
      scaleEnabled: landConfig.scaleEnabled
    };

    const updated = [newSketch, ...savedSketches];
    setSavedSketches(updated);
    localStorage.setItem('dmns_land_sketches', JSON.stringify(updated));
    
    setSketchName('');
    setIsSaving(false);
    
    // Custom sandbox-safe success toast notification
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 4000);
  };

  const deleteSketch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(id);
  };

  const executeDeleteSketch = () => {
    if (!deleteTargetId) return;
    const updated = savedSketches.filter((sk) => sk.id !== deleteTargetId);
    setSavedSketches(updated);
    localStorage.setItem('dmns_land_sketches', JSON.stringify(updated));
    setDeleteTargetId(null);
  };

  const loadSketchToCanvas = (sketch: SavedSketch) => {
    setLoadTargetSketch(sketch);
  };

  const executeLoadSketch = () => {
    if (!loadTargetSketch) return;

    const widthFeet = loadTargetSketch.widthFeet || 100;
    const lengthFeet = loadTargetSketch.lengthFeet || 100;
    const totalSqft = loadTargetSketch.totalSqft || (widthFeet * lengthFeet);
    const sketchUom = loadTargetSketch.uom || 'ft';
    const sketchScaleEnabled = loadTargetSketch.scaleEnabled !== false;

    const imgData = loadTargetSketch.drawingDataUrl || loadTargetSketch.thumbnail;
    loadedDrawingRef.current = imgData;

    // Set configuration to trigger layout mount & scaling
    setLandConfig({
      widthFeet,
      lengthFeet,
      totalSqft,
      isConfigured: true,
      uom: sketchUom,
      scaleEnabled: sketchScaleEnabled
    });

    // Reset history states synchronously so standard mount or redraw uses it
    setHistory([imgData]);
    setHistoryIndex(0);

    // Wait for DOM rendering/mounting/resizing to finish and then paint explicitly to be 100% sure
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = imgData;
      img.onload = () => {
        ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
        ctx.drawImage(img, 0, 0, canvasDimensions.width, canvasDimensions.height);
      };

      // Scroll smoothly to drawing panel
      const element = document.getElementById('drawing-pad-container');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);

    setLoadTargetSketch(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8" id="sketchpad-module">
      
      {/* Title & Introduction block */}
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-serif font-black tracking-tight text-[#1D1D1F] flex items-center gap-2.5">
          <Edit3 className="w-8 h-8 text-[#2563EB]" />
          Layout & Sketch Studio
        </h1>
        <p className="text-sm text-[#6E6E73] max-w-3xl mt-2 font-sans font-normal">
          Interactive planning sandbox. Draft outlines of plot subdivisions, structure orientations, road networks, or landscape blueprints. Draw clean rectangular plots, straight paths, or stamp text labels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Control Sidebar */}
        <div className="lg:col-span-1 bg-white border border-neutral-200/80 rounded-3xl p-5 shadow-sm space-y-6 text-left self-start">
          
          {/* Preset templates */}
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2.5">Canvas Canvas Preset</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBgPreset('grid')}
                className={`py-2 px-3 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 justify-center cursor-pointer ${
                  bgPreset === 'grid' 
                    ? 'bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]' 
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Grid Line
              </button>
              <button
                type="button"
                onClick={() => setBgPreset('blueprint')}
                className={`py-2 px-3 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 justify-center cursor-pointer ${
                  bgPreset === 'blueprint' 
                    ? 'bg-blue-900 border-blue-900 text-white' 
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5 text-indigo-400" />
                Blueprint
              </button>
              <button
                type="button"
                onClick={() => setBgPreset('dots')}
                className={`py-2 px-3 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 justify-center cursor-pointer ${
                  bgPreset === 'dots' 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-700' 
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span className="font-bold">•••</span>
                Dots
              </button>
              <button
                type="button"
                onClick={() => setBgPreset('plain')}
                className={`py-2 px-3 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 justify-center cursor-pointer ${
                  bgPreset === 'plain' 
                    ? 'bg-neutral-900 border-neutral-900 text-white' 
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Blank
              </button>
            </div>
          </div>

          {/* Tools palette */}
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2.5">Boundary Tools</label>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setTool('pencil')}
                className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                  tool === 'pencil'
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <Edit3 className="w-4 h-4 shrink-0" />
                <span>Pencil / Freehand</span>
              </button>

              <button
                type="button"
                onClick={() => setTool('line')}
                className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                  tool === 'line'
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <Slash className="w-4 h-4 shrink-0" />
                <span>Straight Boundary Line</span>
              </button>

              <button
                type="button"
                onClick={() => setTool('rect')}
                className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                  tool === 'rect'
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <Square className="w-4 h-4 shrink-0" />
                <span>Plot Rectangle Zone</span>
              </button>

              <button
                type="button"
                onClick={() => setTool('circle')}
                className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                  tool === 'circle'
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <CircleIcon className="w-4 h-4 shrink-0" />
                <span>Round Tower / Node Circle</span>
              </button>

              <button
                type="button"
                onClick={() => setTool('text')}
                className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                  tool === 'text'
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <Type className="w-4 h-4 shrink-0" />
                <span>Text Marker Label</span>
              </button>

              <button
                type="button"
                onClick={() => setTool('measure')}
                className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                  tool === 'measure'
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <Ruler className="w-4 h-4 shrink-0" />
                <span>Scale / Dimension Tool</span>
              </button>
            </div>
          </div>

          {/* Straight line locking if line tool active */}
          {tool === 'line' && (
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl animate-fade-in space-y-2 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-neutral-800 block">Strictly Straight Lines</label>
                  <span className="text-[10px] text-neutral-500 block">Lock to Horizontal or Vertical</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={orthogonalLock} 
                    onChange={(e) => setOrthogonalLock(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2563EB]"></div>
                </label>
              </div>
              <span className="text-[10px] text-neutral-400 block leading-tight">
                Tip: You can also hold the <kbd className="bg-neutral-200 px-1 rounded text-neutral-700 font-mono text-[9px]">Shift</kbd> key while drawing.
              </span>
            </div>
          )}

          {/* Text input & rotation settings if text tool active */}
          {tool === 'text' && (
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl animate-fade-in space-y-3">
              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Label Text</label>
                <input
                  type="text"
                  value={textLabel}
                  onChange={(e) => setTextLabel(e.target.value)}
                  placeholder="Plot A-23..."
                  className="w-full bg-white text-xs font-semibold px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-[#2563EB] text-[#1D1D1F]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase block">Rotate Label</label>
                  <span className="text-xs font-mono font-bold text-[#2563EB]">{textRotation}°</span>
                </div>
                
                {/* Degree Slider */}
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={textRotation}
                  onChange={(e) => setTextRotation(parseInt(e.target.value))}
                  className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB] mb-2"
                />

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1">
                  {[0, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setTextRotation(deg)}
                      className={`py-1 text-[10px] font-mono font-bold rounded-lg border transition cursor-pointer text-center ${
                        textRotation === deg
                          ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-[10px] text-neutral-400 block leading-tight pt-1.5 border-t border-neutral-200/60">
                Set label & rotation, then click on the canvas to stamp.
              </span>
            </div>
          )}

          {/* Scale / Dimension Tool settings & actions */}
          {tool === 'measure' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl animate-fade-in space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-amber-900 block flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-amber-600" />
                  Dimension Tool Settings
                </label>
                <span className="text-[10px] text-amber-700 block mt-0.5">Plot Sheet scale is calibrated to {landConfig.widthFeet}×{landConfig.lengthFeet} ft</span>
              </div>

              {/* Toggle to allow placing measurement directly on release */}
              <div className="flex items-center justify-between border-t border-amber-200/50 pt-3">
                <div className="max-w-[150px]">
                  <span className="text-[11px] font-bold text-neutral-800 block">Placement Mode</span>
                  <span className="text-[9px] text-neutral-500 block leading-tight">Burn scale lines permanently onto diagram</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowScalePlacement(!allowScalePlacement)}
                  className={`w-9 h-5 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                    allowScalePlacement ? 'bg-amber-600' : 'bg-neutral-200'
                  }`}
                >
                  <div
                    className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ${
                      allowScalePlacement ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Temporary Last Measurement Info & Actions */}
              {lastTemporaryMeasure && (
                <div className="bg-amber-100/50 p-2.5 rounded-xl border border-amber-200/60 space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-amber-800 font-bold uppercase tracking-wider">Active Measure</span>
                    <span className="font-mono font-bold text-amber-900">
                      ↔ {(() => {
                        const dx = lastTemporaryMeasure.end.x - lastTemporaryMeasure.start.x;
                        const dy = lastTemporaryMeasure.end.y - lastTemporaryMeasure.start.y;
                        const distPixels = Math.sqrt(dx * dx + dy * dy);
                        const scaleMarginMultiplier = 1.4;
                        const simulatedWorldWidthFeet = landConfig.widthFeet * scaleMarginMultiplier;
                        const currentPixelsPerFoot = canvasDimensions.width / simulatedWorldWidthFeet;
                        return (distPixels / currentPixelsPerFoot).toFixed(1);
                      })()} ft
                    </span>
                  </div>
                  {!allowScalePlacement && (
                    <button
                      type="button"
                      onClick={() => {
                        const scaleObj = {
                          id: `scale_${Date.now()}`,
                          start: { ...lastTemporaryMeasure.start },
                          end: { ...lastTemporaryMeasure.end }
                        };
                        setPlacedScales(prev => [...prev, scaleObj]);
                        setLastTemporaryMeasure(null);
                      }}
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Place Permanently on Diagram</span>
                    </button>
                  )}
                </div>
              )}

              {/* Selection & Deletion controls */}
              {selectedScaleId ? (
                <div className="bg-red-50 p-2.5 rounded-xl border border-red-200 space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-red-700 font-bold uppercase tracking-wider">Selected Scale</span>
                    <span className="font-mono font-bold text-red-900">
                      ↔ {(() => {
                        const selectedScale = placedScales.find(s => s.id === selectedScaleId);
                        if (!selectedScale) return '0.0';
                        const dx = selectedScale.end.x - selectedScale.start.x;
                        const dy = selectedScale.end.y - selectedScale.start.y;
                        const distPixels = Math.sqrt(dx * dx + dy * dy);
                        const scaleMarginMultiplier = 1.4;
                        const simulatedWorldWidthFeet = landConfig.widthFeet * scaleMarginMultiplier;
                        const currentPixelsPerFoot = canvasDimensions.width / simulatedWorldWidthFeet;
                        return (distPixels / currentPixelsPerFoot).toFixed(1);
                      })()} ft
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPlacedScales(prev => prev.filter(s => s.id !== selectedScaleId));
                      setSelectedScaleId(null);
                    }}
                    className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Selected Scale</span>
                  </button>
                </div>
              ) : (
                placedScales.length > 0 && (
                  <div className="text-[9px] text-amber-800 leading-normal italic text-center border-t border-amber-200/40 pt-2">
                    Tip: Select a scale line directly in the diagram to highlight and delete it.
                  </div>
                )
              )}

              <div className="text-[10px] text-amber-700 block leading-tight pt-1.5 border-t border-amber-200/60">
                Drag to scale and measure multiple times. Change Placement Mode to persist scale lines on the canvas.
              </div>
            </div>
          )}

          {/* Color palette */}
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2.5">Ink Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full border-2 transition duration-150 relative cursor-pointer ${
                    color === c.value ? 'border-neutral-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {color === c.value && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[10px]">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Stroke Width Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Line Thickness</label>
              <span className="text-xs font-mono font-bold text-[#2563EB]">{lineWidth}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
          </div>

          {/* Alignment Snapping */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <span className="text-xs font-bold text-neutral-700">Grid Snapping (20px)</span>
            <button
              type="button"
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                snapToGrid ? 'bg-emerald-600' : 'bg-neutral-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  snapToGrid ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>

        {/* Right Drawing Canvas Center */}
        <div className="lg:col-span-3 space-y-4" id="drawing-pad-container">
          
          {/* Quick Info & Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-100/80 border border-neutral-200 p-3 rounded-2xl">
            <span className="text-xs font-medium text-neutral-700 flex items-center gap-2 text-left leading-tight">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              {landConfig.isConfigured 
                ? `${activeInstruction} | Active Plot: ${landConfig.scaleEnabled ? `${landConfig.widthFeet}×${landConfig.lengthFeet} ${landConfig.uom || 'ft'}` : 'Infinite Grid'}` 
                : "Awaiting physical property dimensions configuration..."}
            </span>
            
            {/* Drawing and Scale/Zoom controls */}
            <div className="flex items-center flex-wrap gap-1.5 self-start sm:self-auto shrink-0">
              {landConfig.isConfigured && (
                <>
                  {/* Zoom controls */}
                  <div className="flex items-center bg-white border border-neutral-200 rounded-xl px-1.5 py-0.5 gap-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setZoom(Math.max(0.4, Number((zoom - 0.1).toFixed(1))))}
                      className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-neutral-500 min-w-[32px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom(Math.min(3.0, Number((zoom + 0.1).toFixed(1))))}
                      className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoom(1.0)}
                      className="text-[9px] font-bold text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 px-1 py-0.5 rounded transition"
                      title="Reset Zoom"
                    >
                      1:1
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTempWidth(landConfig.widthFeet);
                      setTempLength(landConfig.lengthFeet);
                      setTempUom(landConfig.uom || 'ft');
                      setTempScaleEnabled(landConfig.scaleEnabled !== false);
                      setLandConfig(prev => ({ ...prev, isConfigured: false }));
                    }}
                    className="p-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-lg transition text-neutral-600 flex items-center gap-1 text-xs font-semibold"
                    title="Change sheet size and scale"
                  >
                    <Settings className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="hidden md:inline">Scale Settings</span>
                  </button>

                  <div className="w-px h-5 bg-neutral-200 mx-1" />
                </>
              )}

              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0 || !landConfig.isConfigured}
                className="p-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-neutral-600"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1 || !landConfig.isConfigured}
                className="p-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-neutral-600"
                title="Redo"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-5 bg-neutral-200 mx-1" />
              <button
                type="button"
                onClick={clearCanvas}
                disabled={!landConfig.isConfigured}
                className="py-1.5 px-3 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reset layout canvas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Sizing Prompt Wizard OR Interactive Canvas Stage */}
          {!landConfig.isConfigured ? (
            <div className="w-full bg-white border border-neutral-200 rounded-3xl p-6 py-10 md:p-10 text-center shadow-sm space-y-6 flex flex-col items-center justify-center min-h-[460px] animate-fade-in">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Compass className="w-7 h-7" />
              </div>

              <div className="max-w-md space-y-1.5">
                <h2 className="text-xl font-serif font-black text-neutral-900">Configure Property Blueprint Dimensions</h2>
                <p className="text-xs text-neutral-500">
                  Enter the physical width and length of your property (in feet) to generate a correctly scaled blueprint sheet before drawing.
                </p>
              </div>

              {/* Preset Pickers (Strictly in Feet) */}
              <div className="w-full max-w-lg text-left">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2.5">Select Common Plot Preset</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Standard Plot', width: 30, length: 40, desc: '1,200 sqft (30×40 ft)' },
                    { label: 'Medium Parcel', width: 40, length: 60, desc: '2,400 sqft (40×60 ft)' },
                    { label: 'Large Estate', width: 60, length: 100, desc: '6,000 sqft (60×100 ft)' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setTempWidth(preset.width);
                        setTempLength(preset.length);
                        setTempPreset(`${preset.width}x${preset.length}`);
                      }}
                      className={`p-2.5 border rounded-xl text-left transition-all cursor-pointer ${
                        tempWidth === preset.width && tempLength === preset.length
                          ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-neutral-800">{preset.label}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length and Width Inputs */}
              <div className="w-full max-w-lg grid grid-cols-2 gap-4">
                <div>
                  <label className="text-left text-xs font-bold text-neutral-500 block mb-1">Property Width (ft)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      value={tempWidth || ''}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setTempWidth(val);
                        setTempPreset('custom');
                      }}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-800 outline-none focus:bg-white focus:border-blue-600"
                      placeholder="e.g. 60"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-neutral-400">ft</span>
                  </div>
                </div>

                <div>
                  <label className="text-left text-xs font-bold text-neutral-500 block mb-1">Property Length (ft)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      value={tempLength || ''}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setTempLength(val);
                        setTempPreset('custom');
                      }}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-800 outline-none focus:bg-white focus:border-blue-600"
                      placeholder="e.g. 40"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-neutral-400">ft</span>
                  </div>
                </div>
              </div>

              {/* Area summary info box */}
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl w-full max-w-lg text-left flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Estimated Land Area</span>
                  <span className="text-base font-serif font-black text-blue-950">{(tempWidth * tempLength).toLocaleString('en-IN')} SQFT</span>
                </div>
                <span className="text-[11px] text-blue-700 font-medium">Calibrated visual boundaries</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (tempWidth < 10 || tempLength < 10) {
                    alert(`Please enter realistic plot dimensions (minimum 10x10 ft).`);
                    return;
                  }
                  setLandConfig({
                    widthFeet: tempWidth,
                    lengthFeet: tempLength,
                    totalSqft: tempWidth * tempLength,
                    isConfigured: true,
                    uom: 'ft',
                    scaleEnabled: true
                  });
                }}
                className="w-full max-w-lg py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Generate Scaled Blueprint Sheet</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div 
              ref={containerRef} 
              className="relative w-full bg-neutral-100 border border-neutral-200 rounded-3xl shadow-inner overflow-auto select-none cursor-crosshair h-[450px] md:h-[550px]"
              id="canvas-canvas-stage"
            >
              {/* Scroll sizer div that matches the exact scaled dimension of the canvas */}
              <div
                style={{
                  width: `${canvasDimensions.width * zoom}px`,
                  height: `${canvasDimensions.height * zoom}px`,
                  transition: 'width 0.15s ease-out, height 0.15s ease-out'
                }}
                className="relative"
              >
                {/* Background Canvas Layer */}
                <canvas
                  ref={bgCanvasRef}
                  style={{
                    width: `${canvasDimensions.width * zoom}px`,
                    height: `${canvasDimensions.height * zoom}px`,
                    transition: 'width 0.15s ease-out, height 0.15s ease-out'
                  }}
                  className="absolute inset-0 z-10 pointer-events-none"
                />
                {/* Sketch Drawing Layer */}
                <canvas
                  ref={canvasRef}
                  style={{
                    width: `${canvasDimensions.width * zoom}px`,
                    height: `${canvasDimensions.height * zoom}px`,
                    transition: 'width 0.15s ease-out, height 0.15s ease-out'
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="absolute inset-0 z-20"
                />
              </div>
            </div>
          )}

          {/* Bottom Export & Save block */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-neutral-200/80 p-4 rounded-3xl shadow-sm text-left">
            <div>
              <h3 className="text-sm font-bold text-[#1D1D1F]">Ready with your sketch?</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Export layout as PNG image, or register it into your Local Gallery database.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto self-start sm:self-auto">
              <button
                type="button"
                onClick={downloadSketch}
                className="py-2 px-4.5 border border-[#2563EB]/20 hover:border-[#2563EB] hover:bg-blue-50/40 text-[#2563EB] text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>

              {!isSaving ? (
                <button
                  type="button"
                  onClick={() => setIsSaving(true)}
                  className="py-2 px-4.5 bg-[#2563EB] hover:bg-blue-600 active:scale-95 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save to Gallery</span>
                </button>
              ) : (
                <form onSubmit={saveToGallery} className="flex items-center gap-2 bg-neutral-50 p-1.5 rounded-xl border border-neutral-200 w-full sm:max-w-xs animate-fade-in">
                  <input
                    type="text"
                    required
                    value={sketchName}
                    onChange={(e) => setSketchName(e.target.value)}
                    placeholder="E.g., Sector 4 Layout..."
                    className="flex-grow bg-transparent border-none text-neutral-800 text-xs font-bold px-2 outline-none placeholder-neutral-400 min-w-0"
                    autoFocus
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsSaving(false)}
                      className="px-2 py-1 text-[10px] text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200 rounded-md transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-md transition shadow-sm cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* LOCAL GALLERY SECTION */}
          <div className="mt-12 pt-8 border-t border-neutral-200 text-left" id="gallery-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1D1D1F] flex items-center gap-2">
                  <FolderOpen className="w-5.5 h-5.5 text-[#2563EB]" />
                  Saved Sketches Gallery
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Re-load blueprints onto the drawing board or review historic land plans.
                </p>
              </div>
              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <button
                  type="button"
                  id="toggle-gallery-btn"
                  onClick={() => setShowGallery(!showGallery)}
                  className="py-1.5 px-3 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm select-none"
                >
                  {showGallery ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Hide Gallery</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Show Gallery</span>
                    </>
                  )}
                </button>
                {savedSketches.length > 0 && (
                  <span className="text-[11px] font-bold text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full">
                    {savedSketches.length} {savedSketches.length === 1 ? 'Plan' : 'Plans'} Saved
                  </span>
                )}
              </div>
            </div>

            {showGallery && (
              <div className="animate-fade-in" id="gallery-content-wrapper">
                {savedSketches.length === 0 ? (
                  <div className="bg-neutral-50/50 border border-neutral-200/50 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[180px]">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-2.5">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-[#1D1D1F]">Draft layout gallery is empty</h4>
                    <p className="text-[11px] text-neutral-500 max-w-sm mt-1 leading-normal">
                      No layout plans created yet. Draw your proposal layout boundary above and catalog it using "Save to Gallery".
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {savedSketches.map((sk) => (
                      <div 
                        key={sk.id}
                        className="bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col group relative"
                      >
                        {/* Thumbnail box */}
                        <div className="aspect-[4/3] w-full bg-[#1A365D]/5 relative border-b border-neutral-100 overflow-hidden flex items-center justify-center">
                          <img 
                            src={sk.thumbnail} 
                            alt={sk.name} 
                            className="w-full h-full object-contain p-2 hover:scale-105 transition duration-300"
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Delete Overlay */}
                          <button
                            type="button"
                            onClick={(e) => deleteSketch(sk.id, e)}
                            className="absolute top-2 right-2 p-1.5 rounded-xl bg-white/90 backdrop-blur border border-neutral-200 text-neutral-400 hover:text-red-600 hover:bg-white transition duration-150 shadow-sm cursor-pointer z-30"
                            title="Delete draft layout"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Metadata */}
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <div className="text-left">
                            <h4 className="font-bold text-sm text-[#1D1D1F] line-clamp-1">{sk.name}</h4>
                            <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5 font-mono">
                              <Calendar className="w-3 h-3 text-neutral-300" />
                              {sk.date}
                            </span>
                            {sk.notes && (
                              <p className="text-[11px] text-neutral-500 mt-2 line-clamp-2 italic leading-relaxed">
                                {sk.notes}
                              </p>
                            )}
                          </div>

                          {/* Load CTA */}
                          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-neutral-400 font-mono uppercase">Local PNG Draft</span>
                            <button
                              type="button"
                              onClick={() => loadSketchToCanvas(sk)}
                              className="py-1 px-3 border border-[#2563EB]/20 hover:border-[#2563EB] text-[#2563EB] hover:bg-blue-50/40 text-[11px] font-bold rounded-lg transition duration-150 flex items-center gap-1 cursor-pointer"
                            >
                              <MousePointerClick className="w-3 h-3" />
                              <span>Load Sketch</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* CUSTOM SUCCESS TOAST */}
      {showSaveSuccess && (
        <div className="fixed bottom-6 right-6 bg-[#10B981] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-55 animate-fade-in border border-emerald-500 max-w-sm" id="save-success-toast">
          <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold leading-none">Draft Cataloged Successfully!</div>
            <div className="text-[10px] text-emerald-100 mt-0.5">Your layout plan is safely backed up in the gallery.</div>
          </div>
        </div>
      )}

      {/* CUSTOM CLEAR CANVAS CONFIRMATION MODAL */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fade-in" id="clear-confirm-modal">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-serif font-black text-neutral-900">Clear Entire Sketch?</h3>
              <p className="text-xs text-neutral-500 leading-normal">
                Are you sure you want to discard your current design draft? All unsaved lines, shapes, and measurements will be permanently wiped.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                No, Keep It
              </button>
              <button
                type="button"
                onClick={executeClearCanvas}
                className="py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE SKETCH CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fade-in" id="delete-confirm-modal">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-serif font-black text-neutral-900">Delete Saved Sketch?</h3>
              <p className="text-xs text-neutral-500 leading-normal">
                Are you sure you want to permanently delete this saved plan? This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteSketch}
                className="py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM LOAD SKETCH CONFIRMATION MODAL */}
      {loadTargetSketch && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fade-in" id="load-confirm-modal">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-serif font-black text-neutral-900">Load Saved Sketch?</h3>
              <p className="text-xs text-neutral-500 leading-normal">
                Loading <strong className="text-neutral-700">"{loadTargetSketch.name}"</strong> will replace your current unsaved drawing. Are you sure you want to proceed?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLoadTargetSketch(null)}
                className="py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                No, Go Back
              </button>
              <button
                type="button"
                onClick={executeLoadSketch}
                className="py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
              >
                Yes, Load It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
