import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { DashboardView } from './views/DashboardView';
import { CertificatesView } from './views/CertificatesView';
import { CreateCertificateView } from './views/CreateCertificateView';
import { BatchEmissionView } from './views/BatchEmissionView';
import { CoursesView } from './views/CoursesView';
import { ClassesView } from './views/ClassesView';
import { StudentsView } from './views/StudentsView';
import { ValidateCertificateView } from './views/ValidateCertificateView';
import { SettingsView } from './views/SettingsView';
import { ApiManagementView } from './views/ApiManagementView';
import { AuditView } from './views/AuditView';
import { BackupView } from './views/BackupView';
import { ReportsView } from './views/ReportsView';

const DATA_RESET_MARKER = 'certifyai_real_data_reset_v1';

const MainRouter: React.FC = () => {
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'certificates': return <CertificatesView />;
      case 'create-certificate': return <CreateCertificateView />;
      case 'batch-emission': return <BatchEmissionView />;
      case 'courses': return <CoursesView />;
      case 'classes': return <ClassesView />;
      case 'students': return <StudentsView />;
      case 'validate': return <ValidateCertificateView />;
      case 'api': return <ApiManagementView />;
      case 'audit': return <AuditView />;
      case 'backup': return <BackupView />;
      case 'reports': return <ReportsView />;
      case 'settings':
      case 'templates': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return <Layout>{renderView()}</Layout>;
};

export default function App() {
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(DATA_RESET_MARKER)) {
      localStorage.removeItem('certifyai_students');
      localStorage.removeItem('certifyai_certificates');
      localStorage.removeItem('certifyai_audit_logs');
      sessionStorage.removeItem('certifyai_prefill_student');
      localStorage.setItem(DATA_RESET_MARKER, 'done');
    }
    setStorageReady(true);
  }, []);

  if (!storageReady) return null;

  return <AppProvider><MainRouter /></AppProvider>;
}
