import React from 'react';
import PermissionMatrixPage from '../../views/PermissionMatrixPage';

export const metadata = {
  title: 'RBAC Permission Matrix Test Suite | OwnStay',
  description: 'Systematic verification of Phase 24 capability matrix and direct REST API security assertions.',
};

export default function Page() {
  return <PermissionMatrixPage />;
}
