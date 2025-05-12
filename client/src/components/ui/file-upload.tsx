import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';

interface FileUploadProps {
  onFileChange: (file: File) => void;
  onUrlChange?: (url: string) => void;
  initialUrl?: string;
  accept?: string;
  label: string;
  description?: string;
  placeholder?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  onUrlChange,
  initialUrl = '',
  accept = 'image/*',
  label,
  description,
  placeholder = 'Upload an image or enter a URL',
}) => {
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>(initialUrl ? 'url' : 'file');
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    onFileChange(file);
    setPreview(URL.createObjectURL(file));
    setUploadMode('file');
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (onUrlChange) onUrlChange(url);
    setPreview(url || null);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImageUrl('');
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onUrlChange) onUrlChange('');
  };

  const handleModeToggle = (mode: 'file' | 'url') => {
    setUploadMode(mode);
    if (mode === 'file' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
      
      {/* Preview section */}
      {preview && (
        <div className="relative w-full h-32 bg-gray-100 rounded-md mb-2 overflow-hidden">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-contain"
            onError={() => setPreview(null)} 
          />
          <button 
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex space-x-2 mb-2">
        <Button 
          type="button" 
          variant={uploadMode === 'file' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeToggle('file')}
        >
          <Upload size={16} className="mr-1" /> Upload File
        </Button>
        <Button 
          type="button" 
          variant={uploadMode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeToggle('url')}
        >
          <Image size={16} className="mr-1" /> Use URL
        </Button>
      </div>

      {uploadMode === 'file' ? (
        <div className="flex flex-col space-y-2">
          <Input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-24 border-dashed flex flex-col items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={24} className="mb-2" />
            <span>
              {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {accept === 'image/*' ? 'PNG, JPG, GIF up to 10MB' : 'File up to 10MB'}
            </span>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            type="url"
            placeholder={placeholder}
            value={imageUrl}
            onChange={handleUrlChange}
          />
          <p className="text-xs text-gray-500">
            Enter a direct URL to an image (https://example.com/image.jpg)
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;