import { FileText, MessageSquare, Pipette, Sparkles, Type } from 'lucide-react';

export const editorRoomScenes = [
  { id: 'introduction', number: '01', icon: MessageSquare, title: 'Introduction', prompt: 'Opening copy, page name, and first impression.' },
  { id: 'colours', number: '02', icon: Pipette, title: 'Page Colours', prompt: 'Manual colour categories for the booking page.' },
  { id: 'typography', number: '03', icon: Type, title: 'Typography', prompt: 'Font system for headings, labels, and body text.' },
  { id: 'style', number: '04', icon: Sparkles, title: 'Style System', prompt: 'One curated visual direction for the complete booking journey.' },
  { id: 'form', number: '05', icon: FileText, title: 'Client Form', prompt: 'Client details collected before booking.' }
];

export const getEditorRoomId = (roomId, fallback = 'style') => (
  editorRoomScenes.some(scene => scene.id === roomId) ? roomId : fallback
);
