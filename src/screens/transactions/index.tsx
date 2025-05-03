import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import './transactions.css';

interface Transaction {
  name: string;
  date: string;
  transactionId: string;
  comment: string;
  amount: number;
  status: string;
}

const TransactionsPage: React.FC = () => {
  const [transactions] = useState<Transaction[]>([
    {
      name: 'Ernest North Inc.',
      date: '15 Dec 2022 21:50',
      transactionId: '#85761 - 234985712384',
      comment: 'Paycheck deposit',
      amount: 4100,
      status: 'Completed'
    },
    {
      name: 'ATM withdrawal',
      date: '12 Dec 2022 15:30',
      transactionId: '#21456 - 789432569687',
      comment: 'Cash withdrawals',
      amount: -150,
      status: 'Completed'
    },
    {
      name: 'Transfer to Saving Account',
      date: '10 Dec 2022 09:50',
      transactionId: '#98745 - 632196543732',
      comment: 'Bank transfer',
      amount: -1000,
      status: 'Completed'
    },
    {
      name: 'Apple TV+',
      date: '9 Dec 2022 00:01',
      transactionId: '#98765 - 432109876654',
      comment: 'Subscription payment',
      amount: -6.99,
      status: 'Completed'
    },
    {
      name: 'Transfer to Investing Account',
      date: '28 Nov 2022 21:50',
      transactionId: '#56789 - 876543210998',
      comment: 'Bank transfer',
      amount: -2200,
      status: 'Completed'
    }
  ]);

  return (
    <div className="transactions-page">
      <Header />
      <main className="transactions-main">
        <div className="transactions-title-row">
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <h1 className="transactions-title">Transactions</h1>
            <span className="transactions-title-count">112</span>
          </div>
          <div className="action-buttons">
            <button className="action-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
              </svg>
              Export
            </button>
            <button className="action-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 15V3h14v12h-4v4h-2.303L10 15H5zm12-2V5H7v8h4v2.697L13.303 13H17z" fill="currentColor" />
              </svg>
              Import
            </button>
          </div>
        </div>

        <div className="transactions-filters">
          <div className="filter-group">
            <span>Personal Card</span>
          </div>
          <div className="filter-group date">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="#777" />
            </svg>
            <span style={{ marginLeft: '8px' }}>Select date</span>
          </div>
          <div className="filter-group">
            <span>All</span>
          </div>
          <div className="filter-spacer"></div>
          <div className="search-input">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
            </svg>
            <input type="text" placeholder="Search" />
          </div>
          <div className="filter-group">
            <span>Filters (0)</span>
          </div>
        </div>

        <table className="transactions-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Transaction Id</th>
              <th>Comment</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.name}</td>
                <td>{transaction.date}</td>
                <td>{transaction.transactionId}</td>
                <td>{transaction.comment}</td>
                <td style={{ textAlign: 'right' }}>
                  <span className={transaction.amount > 0 ? 'amount-positive' : 'amount-negative'}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} EUR
                  </span>
                </td>
                <td>
                  <span className="status-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#4ade80" />
                    </svg>
                    {transaction.status}
                  </span>
                </td>
                <td>
                  <div className="action-icons">
                    <button className="action-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                      </svg>
                    </button>
                    <button className="action-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default TransactionsPage; 