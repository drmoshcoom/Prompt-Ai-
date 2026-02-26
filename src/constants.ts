import {
  Brush,
  Camera,
  Film,
  Box,
  Palette,
  Sparkles,
  Paintbrush,
  Feather,
  PenTool,
  Image as ImageIcon,
  PersonStanding,
  Square,
  PaintBucket,
  Star,
  LineChart,
  Zap
} from 'lucide-react';

export interface PromptStyle {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  keywords: string[];
  icon: React.ElementType; // Using React.ElementType for Lucide icons
}

export const STYLES: PromptStyle[] = [
  {
    id: 'illustration',
    name: 'رسومات توضيحية',
    description: 'أسلوب رسوم توضيحية، ألوان زاهية، تفاصيل واضحة.',
    previewColor: 'bg-blue-400',
    keywords: ['illustration', 'vector art', 'flat design', 'cartoonish'],
    icon: Paintbrush
  },
  {
    id: 'portrait',
    name: 'بوترية',
    description: 'صورة شخصية، تركيز على الوجه، إضاءة ناعمة.',
    previewColor: 'bg-red-400',
    keywords: ['portrait', 'close-up', 'soft lighting', 'bokeh'],
    icon: PersonStanding
  },
  {
    id: 'cinematic',
    name: 'سينمائي',
    description: 'إضاءة درامية، زوايا تصوير سينمائية، ألوان غنية.',
    previewColor: 'bg-gray-800',
    keywords: ['cinematic', 'film noir', 'dramatic lighting', 'widescreen'],
    icon: Camera
  },
  {
    id: '3d-art',
    name: 'ثلاثي الأبعاد 3D',
    description: 'فن ثلاثي الأبعاد، تصميمات واقعية أو خيالية.',
    previewColor: 'bg-green-500',
    keywords: ['3d render', 'blender', 'maya', 'zbrush', 'octane render'],
    icon: Box
  },
  {
    id: 'digital-art',
    name: 'فن رقمي',
    description: 'لوحات رقمية، فن مفاهيمي، ألوان حيوية.',
    previewColor: 'bg-purple-500',
    keywords: ['digital painting', 'concept art', 'photoshop', 'wacom'],
    icon: PaintBucket
  },
  {
    id: 'anime',
    name: 'أنمي',
    description: 'أسلوب الأنمي الياباني، شخصيات معبرة، ألوان زاهية.',
    previewColor: 'bg-pink-500',
    keywords: ['anime', 'manga', 'japanese animation', 'cel-shaded'],
    icon: Star
  },
  {
    id: 'realistic',
    name: 'واقعي',
    description: 'صور واقعية، تفاصيل دقيقة، إضاءة طبيعية.',
    previewColor: 'bg-neutral-700',
    keywords: ['photorealism', 'high resolution', 'natural light', 'unreal engine'],
    icon: ImageIcon
  },
  {
    id: 'abstract-artistic',
    name: 'خطوط فنية تجريدية',
    description: 'فن تجريدي، أشكال هندسية، ألوان متداخلة.',
    previewColor: 'bg-teal-600',
    keywords: ['abstract', 'geometric', 'minimalist', 'surrealism'],
    icon: LineChart
  },
];

export const ASPECT_RATIOS = [
  { label: '1:1 Square', value: '1:1' },
  { label: '4:3 Standard', value: '4:3' },
  { label: '3:4 Portrait', value: '3:4' },
  { label: '16:9 Widescreen', value: '16:9' },
  { label: '9:16 Vertical', value: '9:16' }
];

export const RESOLUTIONS = [
  { label: 'Standard', value: '1024x1024' },
  { label: 'HD', value: '2048x2048' },
  { label: '4K', value: '4096x4096' }
];
