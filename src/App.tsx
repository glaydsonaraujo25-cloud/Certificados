import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { DashboardView } from './views/DashboardView';
import { CertificatesView } from './views/CertificatesView';
import { CreateCertificateView } from './views/CreateCertificateView';
import { BatchEmissionView } from './views/BatchEmissionView';
import { CoursesView } from './views/CoursesView';
import { StudentsView } from './views/StudentsView';
import { ValidateCertificateView } from './views/ValidateCertificateView';
import { SettingsView } from './views/SettingsView';
import { ApiManagementView } from './views/ApiManagementView';
import { AuditView } from './views/AuditView';
import { BackupView } from './views/BackupView';
import { ReportsView } from './views/ReportsView';

const MainRouter: React.FC = () => {
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'certificates':
        return <CertificatesView />;
      case 'create-certificate':
        return <CreateCertificateView />;
      case 'batch-emission':
        return <BatchEmissionView />;
      case 'courses':
        return <CoursesView />;
      case 'students':
        return <StudentsView />;
      case 'validate':
        return <ValidateCertificateView />;
      case 'api':
        return <ApiManagementView />;
      case 'audit':
        return <AuditView />;
      case 'backup':
        return <BackupView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
      case 'templates':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return <Layout>{renderView()}</Layout>;
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
