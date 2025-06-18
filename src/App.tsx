
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/layout/AppSidebar";
import Index from '@/pages/Index';
import CommitteePage from '@/pages/CommitteePage';
import CommitteeDetail from '@/components/committee/CommitteeDetail';
import SpecificationManagement from '@/components/specification/SpecificationManagement';
import Specifications from '@/pages/Specifications';
import NotFound from '@/pages/NotFound';
import TendersPage from '@/pages/TendersPages';
import ProcurementPlanPage from '@/pages/ProcurementPlanPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import Login from '@/components/auth/LoginForm';
import Register from '@/components/auth/RegistrationForm';
import EmployeeEdit from './components/employee/EmployeeEdit';
import CommitteeUpdate from './components/committee/edit/CommitteEdit';
import RoleHierarchyTree from './components/home/RoleHierarchyTree';
import {ExternalAgency} from '@/components/external-agency/ExternalAgency';
import ProjectDiscussion from '@/pages/ProjectDiscussion';
import Unauthorized from '@/pages/Unauthorized';

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import './App.css';
import UserList from './components/auth/UserList';
import EmployeeDetailList from './components/auth/EmployeeDetail';
import CreateUser from './components/auth/CreateUser';

import CreatedUserList from './components/CreatedUserList';
import PrivateRoute from './components/PrivateRoute';

const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role?.role_name && !allowedRoles.includes(user.role.role_name)) {
    console.log(`ProtectedRoute: User role ${user.role.role_name} not allowed, redirecting to /unauthorized`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-6 shadow-sm sticky top-0 z-50">
            <SidebarTrigger className="h-8 w-8 hover:bg-gray-100 rounded-md transition-colors" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-800">Procurement Portal</h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Public routes without sidebar */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* All other routes with conditional sidebar */}
            <Route path="/*" element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/committee" element={
                    <ProtectedRoute>
                      <CommitteePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/committee/create" element={
                    <ProtectedRoute>
                      <CommitteePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/committees/:id" element={
                    <ProtectedRoute>
                      <CommitteeDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/specifications" element={
                    <ProtectedRoute>
                      <Specifications />
                    </ProtectedRoute>
                  } />
                  <Route path="/specification/:id" element={
                    <ProtectedRoute>
                      <SpecificationManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/tenders" element={
                    <ProtectedRoute>
                      <TendersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/procurement-plan" element={
                    <ProtectedRoute>
                      <ProcurementPlanPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/users" element={
                    <ProtectedRoute>
                      <UserList />
                    </ProtectedRoute>
                  } />
                  <Route path="/employee-details" element={
                    <ProtectedRoute>
                      <EmployeeDetailList />
                    </ProtectedRoute>
                  } />
                  <Route path="/employees/edit/:userId" element={
                    <ProtectedRoute>
                      <EmployeeEdit />
                    </ProtectedRoute>
                  } />
                  <Route path="/committees/edit/:committeeId" element={
                    <ProtectedRoute>
                      <CommitteeUpdate />
                    </ProtectedRoute>
                  } />
                  <Route path="/role-hierarchy" element={
                    <ProtectedRoute>
                      <RoleHierarchyTree />
                    </ProtectedRoute>
                  } />
                  <Route path="/complaints" element={
                    <ProtectedRoute>
                      <ExternalAgency />
                    </ProtectedRoute>
                  } />
                  <Route path="/project/:id" element={
                    <ProtectedRoute>
                      <ProjectDiscussion />
                    </ProtectedRoute>
                  } />
                  <Route path="/create-user" element={
                    <ProtectedRoute>
                      <CreateUser />
                    </ProtectedRoute>
                  } />
                  <Route path="/created-user" element={
                    <ProtectedRoute>
                      <PrivateRoute component={CreatedUserList} />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
            } />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
