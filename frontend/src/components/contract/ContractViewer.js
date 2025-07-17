import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/ContractViewer.css';
import { API_URL } from '../../api/configApi';
const ContractViewer = ({ carData }) => {
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateContract = async () => {
      try {
        setLoading(true);
        // Call API to generate contract
        const response = await axios.post(`${API_URL}/contracts/generate`, {
          carData: carData,
          // Add additional information if needed
        });
        setContractData(response.data);
      } catch (err) {
        console.error('Error generating contract:', err);
        setError('An error occurred while generating the contract. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (carData) {
      generateContract();
    }
  }, [carData]);

  if (loading) {
    return (
      <div className="contract-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Generating contract...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contract-error">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="contract-viewer">
      <div className="contract-header">
        <h2>Car Rental Contract</h2>
        <div className="contract-info">
          <p>Contract Number: {contractData?.contractNumber}</p>
          <p>Creation Date: {new Date().toLocaleDateString('en-US')}</p>
        </div>
      </div>

      <div className="contract-content">
        <section className="contract-section">
          <h3>Vehicle Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Brand:</label>
              <span>{carData.brand}</span>
            </div>
            <div className="info-item">
              <label>Model:</label>
              <span>{carData.model}</span>
            </div>
            <div className="info-item">
              <label>Year:</label>
              <span>{carData.year}</span>
            </div>
            <div className="info-item">
              <label>License Plate:</label>
              <span>{carData.licensePlate}</span>
            </div>
          </div>
        </section>

        <section className="contract-section">
          <h3>Rental Terms</h3>
          <div className="terms-content">
            <p>1. Rental rate: {carData.dailyRate.toLocaleString('en-US')} VND/day</p>
            <p>2. Vehicle pickup location: {carData.location}</p>
            <p>3. Rental period: As agreed by both parties</p>
            <p>4. Payment terms: Pay 50% of contract value in advance</p>
          </div>
        </section>

        <section className="contract-section">
          <h3>Rights and Obligations</h3>
          <div className="terms-content">
            <h4>Lessor:</h4>
            <ul>
              <li>Deliver vehicle on time and at agreed location</li>
              <li>Ensure vehicle is in good condition with complete documentation</li>
              <li>Provide technical support during rental period</li>
            </ul>

            <h4>Lessee:</h4>
            <ul>
              <li>Pay in full as agreed</li>
              <li>Use vehicle for intended purpose only</li>
              <li>Maintain vehicle and property in vehicle</li>
              <li>Compensate for damages if any</li>
            </ul>
          </div>
        </section>

        <div className="contract-signatures">
          <div className="signature-section">
            <h4>Lessor</h4>
            <div className="signature-box">
              <p>Signature</p>
              <div className="signature-line"></div>
            </div>
          </div>
          <div className="signature-section">
            <h4>Lessee</h4>
            <div className="signature-box">
              <p>Signature</p>
              <div className="signature-line"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="contract-actions">
        <button className="btn btn-primary" onClick={() => window.print()}>
          <i className="bi bi-printer me-2"></i>
          Print Contract
        </button>
        <button className="btn btn-success">
          <i className="bi bi-check-circle me-2"></i>
          Confirm Contract
        </button>
      </div>
    </div>
  );
};

export default ContractViewer; 