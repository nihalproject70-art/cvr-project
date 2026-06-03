import { useState, useRef } from 'react';
import { FiUploadCloud, FiTrash2, FiLoader } from 'react-icons/fi';
import { uploadToCloudinary, validateImageFile } from '@/services/cloudinary';
import toast from 'react-hot-toast';

export const CloudinaryUploader = ({
  label = 'Upload Image',
  value = null, // Can be string (single url) or array (multiple urls)
  onChange,     // Callback when value changes: (newValue, newPublicIds)
  publicIds = null, // Can be string (single) or array (multiple)
  multiple = false,
  folder = 'products'
}) => {
  const [uploading, setUploading] = useState(false);
  const [progresses, setProgresses] = useState({});
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!multiple && files.length > 1) {
      toast.error('Only one image can be uploaded here');
      return;
    }

    setUploading(true);
    const newUrls = [];
    const newPublicIds = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        continue;
      }

      const fileId = `${file.name}-${Date.now()}`;
      try {
        const result = await uploadToCloudinary(file, (percent) => {
          setProgresses(prev => ({ ...prev, [fileId]: percent }));
        });
        newUrls.push(result.url);
        newPublicIds.push(result.publicId);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setProgresses(prev => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });
      }
    }

    if (newUrls.length > 0) {
      if (multiple) {
        const currentUrls = Array.isArray(value) ? value : [];
        const currentPublicIds = Array.isArray(publicIds) ? publicIds : [];
        onChange([...currentUrls, ...newUrls], [...currentPublicIds, ...newPublicIds]);
      } else {
        onChange(newUrls[0], newPublicIds[0]);
      }
      toast.success('Upload completed successfully!');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (indexToRemove) => {
    if (multiple) {
      const currentUrls = Array.isArray(value) ? value : [];
      const currentPublicIds = Array.isArray(publicIds) ? publicIds : [];
      const updatedUrls = currentUrls.filter((_, idx) => idx !== indexToRemove);
      const updatedPublicIds = currentPublicIds.filter((_, idx) => idx !== indexToRemove);
      onChange(updatedUrls, updatedPublicIds);
    } else {
      onChange(null, null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const urls = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []);

  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
        {label}
      </label>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-wood/20 hover:border-gold/50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-cream/30 min-h-40"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={multiple}
          accept="image/*"
          className="hidden"
        />

        <FiUploadCloud className="text-wood/40 mb-3" size={32} />
        <p className="text-sm font-medium text-espresso">
          Drag & drop your image here, or <span className="text-gold hover:underline">browse</span>
        </p>
        <p className="text-xs text-wood-light mt-1">
          Supports JPG, PNG, WEBP. Max 10MB.
        </p>
      </div>

      {/* Progress Bars */}
      {Object.entries(progresses).map(([fileId, percent]) => (
        <div key={fileId} className="w-full bg-cream rounded-full h-2 overflow-hidden border border-wood/5">
          <div
            className="bg-gold h-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      ))}

      {/* Image Previews */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
          {urls.map((url, index) => (
            <div key={url} className="group relative aspect-square border border-wood/10 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow transition-all">
              <img
                src={url}
                alt="Upload preview"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute inset-0 bg-espresso/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                <FiTrash2 size={18} className="hover:text-error transition-colors" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
