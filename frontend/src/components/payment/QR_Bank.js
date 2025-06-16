import React, { useEffect, useState } from 'react';
import { Modal, Spin, message } from 'antd';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './QR_Bank.css';

const QR_Bank = ({ visible, onClose, qrCode, orderCode, userId }) => {
    const [loading, setLoading] = useState(false);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        if (visible && userId) {
            // Initialize WebSocket connection
            const socket = new SockJS('http://localhost:8080/ws');
            const client = new Client({
                webSocketFactory: () => socket,
                onConnect: () => {
                    console.log('Connected to WebSocket');
                    client.subscribe(`/topic/payment/${userId}`, (message) => {
                        const data = JSON.parse(message.body);
                        if (data.status === 'SUCCESS') {
                            message.success('Thanh toán thành công!');
                            onClose(true); // Pass true to indicate success
                        } else if (data.status === 'FAILED') {
                            message.error('Thanh toán thất bại!');
                            onClose(false);
                        }
                    });
                },
                onDisconnect: () => {
                    console.log('Disconnected from WebSocket');
                }
            });

            client.activate();
            setStompClient(client);

            return () => {
                if (client) {
                    client.deactivate();
                }
            };
        }
    }, [visible, userId]);

    return (
        <Modal
            title="Thanh toán qua QR Code"
            open={visible}
            onCancel={() => onClose(false)}
            footer={null}
            width={400}
            className="qr-bank-modal"
        >
            <div className="qr-container">
                {loading ? (
                    <Spin size="large" />
                ) : (
                    <>
                        <img src={qrCode} alt="QR Code" className="qr-code" />
                        <p className="payment-id">Mã đơn hàng: {orderCode}</p>
                        <p className="instruction">
                            Vui lòng quét mã QR bằng ứng dụng ngân hàng của bạn để thanh toán
                        </p>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default QR_Bank; 