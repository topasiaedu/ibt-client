import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import FlowbiteWrapper from './components/FlowbiteWrapper';
import { SignInPage } from './pages/auth/SignInPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<FlowbiteWrapper />}>
          {/* <Route path="/" element={<DashboardPage />} index />
          <Route path="/mailing/compose" element={<MailingComposePage />} />
          <Route path="/mailing/inbox" element={<MailingInboxPage />} />
          <Route path="/mailing/read" element={<MailingReadPage />} />
          <Route path="/mailing/reply" element={<MailingReplyPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/pages/pricing" element={<PricingPage />} />
          <Route path="/pages/maintenance" element={<MaintenancePage />} />
          <Route path="/pages/404" element={<NotFoundPage />} />
          <Route path="/pages/500" element={<ServerErrorPage />} /> */}
          <Route path="/authentication/sign-in" element={<SignInPage />} />
          {/* <Route path="/authentication/sign-up" element={<SignUpPage />} /> */}
          {/* <Route
            path="/authentication/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route
            path="/authentication/reset-password"
            element={<ResetPasswordPage />}
          /> */}
          {/* <Route
            path="/authentication/profile-lock"
            element={<ProfileLockPage />}
          />
          <Route
            path="/e-commerce/billing"
            element={<EcommerceBillingPage />}
          />
          <Route
            path="/e-commerce/invoice"
            element={<EcommerceInvoicePage />}
          />
          <Route
            path="/e-commerce/products"
            element={<EcommerceProductsPage />}
          />
          <Route path="/users/feed" element={<UserFeedPage />} />
          <Route path="/users/list" element={<UserListPage />} />
          <Route path="/users/profile" element={<UserProfilePage />} />
          <Route path="/users/settings" element={<UserSettingsPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
