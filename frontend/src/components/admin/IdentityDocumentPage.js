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
  const [bulkProcessing, setBulkProcessing] = useState({});
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

  const handleBulkAccept = async (userId, documentType) => {
    const processingKey = `${userId}-${documentType}`;
    setBulkProcessing(prev => ({ ...prev, [processingKey]: true }));
    try {
      const response = await axios.put(`${API_URL}/admin/user-identity-documents/bulk-verify`, {
        userId,
        documentType,
        accept: true
      });
      showSuccessToast(response.data || 'All documents verified successfully!');
      // Update documents state directly
      setDocuments(prevDocs => prevDocs.map(doc =>
        doc.userId === userId && doc.documentType === documentType && doc.verified === 0
          ? { ...doc, verified: 1 }
          : doc
      ));
    } catch (err) {
      console.error('Bulk accept error:', err);
      const errorMessage = err.response?.data || 'Failed to verify documents';
      showErrorToast(errorMessage);
    }
    setBulkProcessing(prev => ({ ...prev, [processingKey]: false }));
  };

  const handleBulkReject = async (userId, documentType) => {
    const processingKey = `${userId}-${documentType}`;
    const rejectReasonKey = `bulk-${userId}-${documentType}`;
    
    if (!rejectReason[rejectReasonKey]) {
      showErrorToast('Please enter a reject reason');
      return;
    }
    
    setBulkProcessing(prev => ({ ...prev, [processingKey]: true }));
    try {
      const response = await axios.put(`${API_URL}/admin/user-identity-documents/bulk-verify`, {
        userId,
        documentType,
        accept: false,
        rejectReason: rejectReason[rejectReasonKey]
      });
      showSuccessToast(response.data || 'All documents rejected and user notified!');
      // Remove rejected documents from state
      setDocuments(prevDocs => prevDocs.filter(doc =>
        !(doc.userId === userId && doc.documentType === documentType && doc.verified === 0)
      ));
    } catch (err) {
      console.error('Bulk reject error:', err);
      const errorMessage = err.response?.data || 'Failed to reject documents';
      showErrorToast(errorMessage);
    }
    setBulkProcessing(prev => ({ ...prev, [processingKey]: false }));
  };

  // Group documents by userId and documentType
  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.userId]) acc[doc.userId] = {};
    if (!acc[doc.userId][doc.documentType]) acc[doc.userId][doc.documentType] = [];
    acc[doc.userId][doc.documentType].push(doc);
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
      {Object.entries(groupedDocs).map(([userId, docTypes]) => {
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
            
            {Object.entries(docTypes).map(([documentType, docs]) => {
              const unverifiedDocs = docs.filter(doc => doc.verified === 0);
              const verifiedDocs = docs.filter(doc => doc.verified === 1);
              const processingKey = `${userId}-${documentType}`;
              const rejectReasonKey = `bulk-${userId}-${documentType}`;
              const isProcessing = bulkProcessing[processingKey];
              
              return (
                <div key={`${userId}-${documentType}`} className="document-type-group">
                  <div className="document-type-header">
                    <h4>{documentType === 'cccd' ? 'National ID' : 'Driver License'} Documents</h4>
                    <div className="document-stats">
                      <span className="verified-count">Verified: {verifiedDocs.length}</span>
                      <span className="pending-count">Pending: {unverifiedDocs.length}</span>
                    </div>
                  </div>
                  
                  <div className="id-docs-table-wrapper">
                    <table className="identity-documents-table id-docs-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Description</th>
                          <th>Uploaded At</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {docs.map(doc => (
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
                                <span>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Bulk Actions for unverified documents - moved below table */}
                  {unverifiedDocs.length > 0 && (
                    <div className="bulk-actions">
                      <div className="bulk-action-buttons">
                        <button
                          className="id-docs-btn accept bulk-btn"
                          disabled={isProcessing}
                          onClick={() => handleBulkAccept(userId, documentType)}
                        >
                          {isProcessing ? 'Processing...' : `Accept All (${unverifiedDocs.length})`}
                        </button>
                        <input
                          type="text"
                          className="id-docs-reject-input bulk-input"
                          placeholder="Reject reason for all documents (required)"
                          value={rejectReason[rejectReasonKey] || ''}
                          onChange={e => setRejectReason({ ...rejectReason, [rejectReasonKey]: e.target.value })}
                        />
                        <button
                          className="id-docs-btn reject bulk-btn"
                          disabled={isProcessing}
                          onClick={() => handleBulkReject(userId, documentType)}
                        >
                          {isProcessing ? 'Processing...' : `Reject All (${unverifiedDocs.length})`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default IdentityDocumentPage; 