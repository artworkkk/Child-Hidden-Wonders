export type LandmarkType = 'Man-made' | 'Natural';
export type QuestionType = 'length' | 'height';

export interface Landmark {
  id: string;
  name: string;
  type: LandmarkType;
  measurement: string;
  questionType: QuestionType;
  prideFact: string;
  typeHint: string;
  icon: string;
  color: string;
  x: number; // percentage from left
  y: number; // percentage from top
  image: string;
}

export const LANDMARKS: Landmark[] = [
  {
    id: 'great-wall',
    name: 'The Great Wall',
    type: 'Man-made',
    measurement: '21,196 km long',
    questionType: 'length',
    prideFact: 'Symbol of unity and history',
    typeHint: 'This was built by thousands of workers using stone and brick many years ago.',
    icon: 'Castle',
    color: 'bg-orange-400',
    x: 75,
    y: 25,
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'yangtze-river',
    name: 'The Yangtze River',
    type: 'Natural',
    measurement: '6,300 km long',
    questionType: 'length',
    prideFact: 'The mother river of China',
    typeHint: 'This is a flow of water that has existed for millions of years, created by the Earth itself.',
    icon: 'Waves',
    color: 'bg-blue-400',
    x: 65,
    y: 50,
    image: 'https://images.unsplash.com/photo-1547984602-40d66792f59d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'mount-everest',
    name: 'Mount Everest',
    type: 'Natural',
    measurement: '8,848.86 m high',
    questionType: 'height',
    prideFact: 'The world’s highest peak',
    typeHint: 'This giant mountain was formed by the movement of the Earth’s crust over a very long time.',
    icon: 'Mountain',
    color: 'bg-slate-400',
    x: 25,
    y: 65,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'oriental-pearl-tower',
    name: 'Oriental Pearl Radio & Television Tower',
    type: 'Man-made',
    measurement: '468 m high',
    questionType: 'height',
    prideFact: 'A world-famous TV tower in Shanghai',
    typeHint: 'Architects and engineers designed this tall building and workers built it with steel and glass.',
    icon: 'Building2',
    color: 'bg-indigo-400',
    x: 88,
    y: 50,
    image: 'https://images.unsplash.com/photo-1477586957327-847a0f3f4fe3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'leshan-buddha',
    name: 'Leshan Giant Buddha',
    type: 'Man-made',
    measurement: '71 m high',
    questionType: 'height',
    prideFact: 'A marvel of ancient art',
    typeHint: 'Ancient craftsmen carved this huge statue directly into a stone cliff over 1,000 years ago.',
    icon: 'Flower2',
    color: 'bg-emerald-400',
    x: 55,
    y: 55,
    image: 'https://images.unsplash.com/photo-1590424768404-3286f9037267?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'hzm-bridge',
    name: 'Hong Kong-Zhuhai-Macao Bridge',
    type: 'Man-made',
    measurement: '55 km long',
    questionType: 'length',
    prideFact: 'The world’s longest sea-crossing bridge',
    typeHint: 'This amazing structure was built by modern engineers to connect different cities across the sea.',
    icon: 'Bridge',
    color: 'bg-cyan-400',
    x: 78,
    y: 80,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80'
  }
];
