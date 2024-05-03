import React from "react";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { AlertComponent } from "./components/AlertComponent";
import FlowbiteWrapper from "./components/FlowbiteWrapper";
import ProtectedRoute from "./components/ProtectedRoute";
import { AlertProvider } from "./context/AlertContext";
import { AuthProvider } from "./context/AuthContext";
import { CampaignProvider } from "./context/CampaignContext";
import { ContactProvider } from "./context/ContactContext";
import { ContactListProvider } from "./context/ContactListContext";
import { MessagesProvider } from "./context/MessagesContext";
import { PhoneNumberProvider } from "./context/PhoneNumberContext";
import { ProjectProvider } from "./context/ProjectContext";
import { TemplateProvider } from "./context/TemplateContext";
import { WhatsAppBusinessAccountProvider } from "./context/WhatsAppBusinessAccountContext";
import './index.css';
import DashboardPage from "./pages";
import ForgotPasswordPage from "./pages/authentication/forgot-password";
import ProfileLockPage from "./pages/authentication/profile-lock";
import ResetPasswordPage from "./pages/authentication/reset-password";
import SignInPage from "./pages/authentication/sign-in";
import SignUpPage from "./pages/authentication/sign-up";
import ContactListPage from "./pages/contacts/list";
import EcommerceBillingPage from "./pages/e-commerce/billing";
import EcommerceInvoicePage from "./pages/e-commerce/invoice";
import EcommerceProductsPage from "./pages/e-commerce/products";
import PrivacyPage from "./pages/legal/privacy";
import MailingComposePage from "./pages/mailing/compose";
import MailingInboxPage from "./pages/mailing/inbox";
import MailingReadPage from "./pages/mailing/read";
import MailingReplyPage from "./pages/mailing/reply";
import NotFoundPage from "./pages/pages/404";
import ServerErrorPage from "./pages/pages/500";
import LoadingPage from "./pages/pages/loading";
import MaintenancePage from "./pages/pages/maintenance";
import PricingPage from "./pages/pages/pricing";
import UserFeedPage from "./pages/users/feed";
import UserListPage from "./pages/users/list";
import UserProfilePage from "./pages/users/profile";
import UserSettingsPage from "./pages/users/settings";
import CampaignListPage from "./pages/whatsapp/campaigns/list";
import WhatsAppContactListPage from "./pages/whatsapp/contact-list/list";
import ConversationPage from "./pages/whatsapp/conversation/index";
import TemplateListPage from "./pages/whatsapp/templates/list";
import FlowEditor from "./pages/whatsapp/workflow/editor";
import WorkflowListPage from "./pages/whatsapp/workflow/list";

const App = () => (
  <AlertProvider>
    <AuthProvider>
      <ProjectProvider>
        <ContactProvider>
          <ContactListProvider>
              <WhatsAppBusinessAccountProvider>
            <PhoneNumberProvider>
                <CampaignProvider>
                  <MessagesProvider>
                    <TemplateProvider>
                      <AlertComponent />
                      <BrowserRouter>
                        <Routes>
                          <Route element={<FlowbiteWrapper />}>
                            {/* Protected Routes */}
                            <Route element={<ProtectedRoute />} >
                              <Route path="/" element={<DashboardPage />} index />
                              <Route path="/mailing/compose" element={<MailingComposePage />} />
                              <Route path="/mailing/inbox" element={<MailingInboxPage />} />
                              <Route path="/mailing/read" element={<MailingReadPage />} />
                              <Route path="/mailing/reply" element={<MailingReplyPage />} />
                              <Route path="/e-commerce/billing" element={<EcommerceBillingPage />} />
                              <Route path="/e-commerce/invoice" element={<EcommerceInvoicePage />} />
                              <Route path="/e-commerce/products" element={<EcommerceProductsPage />} />
                              <Route path="/users/feed" element={<UserFeedPage />} />
                              <Route path="/users/list" element={<UserListPage />} />
                              <Route path="/contacts" element={<ContactListPage />} />
                              <Route path="/whatsapp/conversation" element={<ConversationPage />} />
                              <Route path="/whatsapp/campaigns" element={<CampaignListPage />} />
                              <Route path="/whatsapp/templates" element={<TemplateListPage />} />
                              <Route path="/whatsapp/contact-list" element={<WhatsAppContactListPage />} />
                              <Route path="/whatsapp/workflow" element={<WorkflowListPage />} />
                              <Route path="/whatsapp/workflow/editor/:id" element={<FlowEditor />} />
                              <Route path="/users/profile" element={<UserProfilePage />} />
                              <Route path="/users/settings" element={<UserSettingsPage />} />
                            </Route>

                            {/* Public Routes */}
                            <Route path="/pages/pricing" element={<PricingPage />} />
                            <Route path="/pages/maintenance" element={<MaintenancePage />} />
                            <Route path="/authentication/sign-in" element={<SignInPage />} />
                            <Route path="/authentication/sign-up" element={<SignUpPage />} />
                            <Route path="/authentication/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/authentication/reset-password" element={<ResetPasswordPage />} />
                            <Route path="/authentication/profile-lock" element={<ProfileLockPage />} />

                            {/* Legal Pages */}
                            <Route path="/legal/privacy" element={<PrivacyPage />} />

                            {/* Testing */}
                            <Route path="/loading" element={<LoadingPage />} />

                            {/* Error Handling Routes */}
                            <Route path="/500" element={<ServerErrorPage />} />
                            <Route path="*" element={<NotFoundPage />} />

                          </Route>
                        </Routes>
                      </BrowserRouter>
                    </TemplateProvider>
                  </MessagesProvider>
                </CampaignProvider>
            </PhoneNumberProvider>
              </WhatsAppBusinessAccountProvider>
          </ContactListProvider>
        </ContactProvider>
      </ProjectProvider>
    </AuthProvider>
  </AlertProvider>
);

export default App;