
export enum BlockType {
  TEXT = 'TEXT',
  CODE = 'CODE',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  TODO = 'TODO',
  HEADING = 'HEADING',
}

export interface Block {
  id: string;
  type: BlockType;
  content: string; // For most, this is a string. For Code, it's a JSON string.
}

export enum CanvasType {
  NOTE = 'NOTE',
  PLAYGROUND = 'PLAYGROUND',
}

export interface PlaygroundContent {
  html: string;
  css: string;
  js: string;
}

export interface Canvas {
  id: string;
  title: string;
  type: CanvasType;
  createdAt: string;
  isPinned?: boolean;
  blocks?: Block[];
  playgroundContent?: PlaygroundContent;
}

export interface Project {
  id: string;
  name: string;
  canvases: Canvas[];
  parentId: string | null;
}
