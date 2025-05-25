import { useState, useRef, useEffect } from 'react';

const FileUpload = ({ label, accept = "image/*", onChange, preview = true, value = null }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Reset preview when value is null
  useEffect(() => {
    if (value === null) {
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
      if (preview) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium bg-gradient-to-r from-neon-blue-light to-neon-purple-light bg-clip-text text-transparent">
          {label}
        </label>
      )}
      
      <div className="relative group">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
        
        {preview && previewUrl ? (
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                className="btn-secondary"
              >
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-white/20 hover:border-neon-purple-light/50 transition-colors cursor-pointer group overflow-hidden"
          >
            <div className="absolute inset-0 bg-glass-card group-hover:bg-glass-white transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-glass-white flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4-4m0 0L20 4m-4 4l4-4m-4 4l-4 4m4-4l4 4m-12 4l4-4"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-white">
                  Click or drag file to upload
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Supports: JPG, PNG, GIF (Max 10MB)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 