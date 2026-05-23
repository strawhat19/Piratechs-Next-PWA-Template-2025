'use client';

import './rich-text.scss';

import dynamic from 'next/dynamic';
import { CSSProperties, useMemo } from 'react';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }) as any;

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['blockquote', 'link', 'clean'],
];

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'blockquote',
  'list',
  'indent',
  'align',
  'link',
];

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const isBlankRichText = (value: string) => /^(?:<p><br><\/p>|<p>&nbsp;<\/p>|<div><br><\/div>|\s*)$/i.test(value);
const hasRichTextMarkup = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

export const normalizeRichTextValue = (value?: string) => {
  const text = String(value ?? ``).trim();
  if (!text || isBlankRichText(text)) return ``;
  return text.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ``).trim();
};

export const toRichTextMarkup = (value?: string) => {
  const text = normalizeRichTextValue(value);
  if (!text) return ``;
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return escapeHtml(text).replace(/\n/g, `<br />`);
};

export const richTextToPlainText = (value?: string, preserveSpaces = false) => {
  const rawText = String(value ?? ``);
  if (!rawText) return ``;
  if (preserveSpaces && !hasRichTextMarkup(rawText)) return rawText;
  const text = normalizeRichTextValue(rawText);
  if (!text) return ``;
  return text
    .replace(/<\s*br\s*\/?\s*>/gi, ` `)
    .replace(/<\/(p|div|li|h[1-6])>/gi, ` `)
    .replace(/<[^>]+>/g, ` `)
    .replace(/&nbsp;/gi, ` `)
    .replace(/&amp;/gi, `&`)
    .replace(/&lt;/gi, `<`)
    .replace(/&gt;/gi, `>`)
    .replace(/&quot;/gi, `"`)
    .replace(/&#39;/gi, `'`)
    .replace(/\s+/g, ` `)
    .trim();
};

type RichTextEditorFieldProps = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  className?: string;
};

type RichTextContentProps = {
  value?: string;
  className?: string;
};

export const RichTextContent = ({ value, className = `` }: RichTextContentProps) => {
  const markup = toRichTextMarkup(value);
  if (!markup) return null;
  return <div className={`richTextContent ${className}`.trim()} dangerouslySetInnerHTML={{ __html: markup }} />;
};

export default function RichTextEditorField({
  label,
  value = ``,
  onChange,
  placeholder = ``,
  minHeight = 180,
  className = ``,
}: RichTextEditorFieldProps) {
  const modules = useMemo(() => ({
    toolbar: toolbarOptions,
    clipboard: { matchVisual: false },
  }), []);
  const editorMinHeight = typeof minHeight == `number` ? `${minHeight}px` : minHeight;
  const style = editorMinHeight ? ({ [`--rich-text-editor-min-height`]: editorMinHeight } as CSSProperties) : undefined;

  return (
    <div className={`richTextField ${className}`.trim()} style={style}>
      <span>{label}</span>
      <div className={`richTextEditorShell`}>
        <ReactQuill
          theme={`snow`}
          value={value || ``}
          onChange={(nextValue: string) => onChange(normalizeRichTextValue(nextValue))}
          placeholder={placeholder || label}
          modules={modules}
          formats={formats}
        />
      </div>
    </div>
  );
}
