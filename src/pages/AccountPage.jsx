import React from 'react';
import { Card } from 'flowbite-react';
import StaffHeader from '../components/staff/Header.jsx';
import AccountTable from '../components/account/AccountTable.jsx';

const StaffPage = () => {
  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        <AccountTable />
      </div>
    </div>
  );
};

export default StaffPage;
