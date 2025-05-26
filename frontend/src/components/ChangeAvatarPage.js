import React, { useState } from 'react';

const ChangeAvatarPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
      setUploadSuccess(false);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Vui lòng chọn ảnh để tải lên.');
      return;
    }

    console.log('Uploading file:', selectedFile.name);
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      alert('Ảnh đại diện đã được tải lên thành công (mô phỏng)!');
    }, 1500);
  };

  return (
    <div>
      <h2>Đổi ảnh đại diện</h2>
      <div>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      {previewUrl && (
        <div style={{ marginTop: '20px' }}>
          <p>Ảnh xem trước:</p>
          <img src={previewUrl} alt="Xem trước ảnh đại diện" style={{ maxWidth: '200px', maxHeight: '200px' }} />
        </div>
      )}
      <button onClick={handleUpload} disabled={!selectedFile || uploading} style={{ marginTop: '20px' }}>
        {uploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
      </button>
      {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
      {uploadSuccess && <p style={{ color: 'green' }}>Tải lên thành công!</p>}
    </div>
  );
};

export default ChangeAvatarPage; 