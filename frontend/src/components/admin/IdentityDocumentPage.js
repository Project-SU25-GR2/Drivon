import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/configApi';
import { showSuccessToast, showErrorToast } from '../notification/notification';

const IdentityDocumentPage = () => {
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectReason, setRejectReason] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/admin/user-identity-documents`),
        axios.get(`${API_URL}/admin/users`)
      ]);
      setDocuments(docsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to fetch documents or users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAccept = async (imageId) => {
    setProcessingId(imageId);
    try {
      await axios.put(`${API_URL}/admin/user-identity-documents/${imageId}/verify`, { accept: true });
      showSuccessToast('Document verified successfully!');
      fetchDocuments();
    } catch (err) {
      showErrorToast('Failed to verify document');
    }
    setProcessingId(null);
  };

  const handleReject = async (imageId) => {
    if (!rejectReason[imageId]) {
      showErrorToast('Please enter a reject reason');
      return;
    }
    setProcessingId(imageId);
    try {
      await axios.put(`${API_URL}/admin/user-identity-documents/${imageId}/verify`, { accept: false, rejectReason: rejectReason[imageId] });
      showSuccessToast('Document rejected and user notified!');
      fetchDocuments();
    } catch (err) {
      showErrorToast('Failed to reject document');
    }
    setProcessingId(null);
  };

  // Group documents by userId
  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.userId]) acc[doc.userId] = [];
    acc[doc.userId].push(doc);
    return acc;
  }, {});

  // Map userId to user info
  const userMap = users.reduce((acc, user) => {
    acc[user.userId] = user;
    return acc;
  }, {});

  if (loading) return <div>Loading identity documents...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="identity-documents-page">
      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div className="id-docs-modal" onClick={() => setZoomedImage(null)}>
          <div className="id-docs-modal-content" onClick={e => e.stopPropagation()}>
            <img src={zoomedImage} alt="Zoomed Document" className="id-docs-modal-img" />
            <button className="id-docs-modal-close" onClick={() => setZoomedImage(null)}>&times;</button>
          </div>
        </div>
      )}
      <h2 className="id-docs-title">User Identity Document Verification</h2>
      {Object.keys(groupedDocs).length === 0 && (
        <div className="id-docs-empty">No identity documents found.</div>
      )}
      {Object.entries(groupedDocs).map(([userId, docs]) => {
        const user = userMap[userId];
        return (
          <div key={userId} className="user-documents-block id-docs-card">
            <div className="id-docs-user-info">
              <strong>User Information:</strong><br />
              {user ? (
                <>
                  <div>Full Name: <b>{user.fullName || 'N/A'}</b></div>
                  <div>Email: <b>{user.email || 'N/A'}</b></div>
                  <div>Phone: <b>{user.phone || 'N/A'}</b></div>
                  <div>Address: <b>{user.address || 'N/A'}</b></div>
                </>
              ) : (
                <div className="id-docs-user-notfound">User not found (ID: {userId})</div>
              )}
            </div>
            <div className="id-docs-table-wrapper">
              <table className="identity-documents-table id-docs-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Uploaded At</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.filter(doc => doc.documentType === 'cccd' || doc.documentType === 'license').map(doc => (
                    <tr key={doc.imageId}>
                      <td>
                        <img
                          src={doc.imageUrl}
                          alt={doc.documentType}
                          className="id-docs-img zoomable"
                          onClick={() => setZoomedImage(doc.imageUrl)}
                          style={{ cursor: 'zoom-in' }}
                        />
                      </td>
                      <td>{doc.documentType === 'cccd' ? 'National ID' : 'Driver License'}</td>
                      <td>{doc.description}</td>
                      <td>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : ''}</td>
                      <td>
                        {doc.verified === 1 ? (
                          <span className="id-docs-badge verified">Verified</span>
                        ) : (
                          <span className="id-docs-badge not-verified">Not Verified</span>
                        )}
                      </td>
                      <td>
                        {doc.verified === 1 ? (
                          <span>—</span>
                        ) : (
                          <div className="id-docs-action-group">
                            <button
                              className="id-docs-btn accept"
                              disabled={processingId === doc.imageId}
                              onClick={() => handleAccept(doc.imageId)}
                            >
                              {processingId === doc.imageId ? 'Processing...' : 'Accept'}
                            </button>
                            <input
                              type="text"
                              className="id-docs-reject-input"
                              placeholder="Reject reason (required)"
                              value={rejectReason[doc.imageId] || ''}
                              onChange={e => setRejectReason({ ...rejectReason, [doc.imageId]: e.target.value })}
                            />
                            <button
                              className="id-docs-btn reject"
                              disabled={processingId === doc.imageId}
                              onClick={() => handleReject(doc.imageId)}
                            >
                              {processingId === doc.imageId ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IdentityDocumentPage; 