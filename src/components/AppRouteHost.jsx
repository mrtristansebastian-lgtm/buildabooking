import { BrandLoader } from './AppLoading';
import { LegalDialog } from './AppOverlays';
import { AppLoginScreen, AuthDialog, shouldUseRedirectGoogleAuth } from '../features/auth';
import { ClientPortalGate } from '../features/client-portal';
import { DashboardRouteShell } from '../features/dashboard';
import { PublicBookingPage } from '../features/public-booking';
import { legalPages } from '../config/appConfig';

export function AppRouteHost({
  appId,
  auth,
  clientPortal,
  dashboard,
  db,
  landing,
  publicBooking,
  route
}) {
  const authDialog = (
    <AuthDialog
      open={auth.panelOpen}
      persona={auth.persona}
      mode={auth.mode}
      busy={auth.busy}
      form={auth.form}
      error={auth.error}
      keepLoggedIn={auth.keepLoggedIn}
      usesRedirectGoogleAuth={shouldUseRedirectGoogleAuth()}
      onClose={() => { auth.setPanelOpen(false); auth.setError(''); }}
      onPersonaChange={auth.setPersona}
      onGoogleAuth={auth.onGoogleAuth}
      onKeepLoggedInChange={auth.setKeepLoggedIn}
      onGuestDashboard={auth.onGuestDashboard}
      onClientGuestPortal={auth.onClientGuestPortal}
      onFormChange={(updates) => auth.setForm(prev => ({ ...prev, ...updates }))}
      onSubmit={auth.onSubmit}
      onToggleMode={() => {
        auth.setMode(auth.mode === 'signup' ? 'signin' : 'signup');
        auth.setError('');
      }}
    />
  );

  if (!route.publicSlug && route.loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <BrandLoader label="Loading workspace" />
      </div>
    );
  }

  if (route.publicSlug) {
    return (
      <PublicBookingPage
        error={publicBooking.error}
        loading={publicBooking.loading || route.loading}
        manualPaymentOptions={publicBooking.manualPaymentOptions}
        paymentOptions={publicBooking.paymentOptions}
        onComplete={publicBooking.onComplete}
        onHome={() => { window.location.href = window.location.origin; }}
        onInstallApp={publicBooking.onInstallApp}
        onRetry={publicBooking.onRetry}
        slug={route.publicSlug}
        workspace={publicBooking.workspace}
      />
    );
  }

  if (route.view === 'client') {
    return (
      <ClientPortalGate
        appId={appId}
        db={db}
        user={clientPortal.user}
        isGuestPreview={clientPortal.isGuestPreview}
        authDialog={authDialog}
        onOpenClientAuth={() => auth.openPanel('signin', 'client')}
        onPreviewClient={auth.onClientGuestPortal}
        onExitGuestPreview={() => {
          clientPortal.setGuestPreview(false);
          route.applyWorkspaceRoute({ view: 'landing' });
        }}
        onSignOut={auth.onSignOut}
        onOwnerLogin={() => route.applyWorkspaceRoute({ view: 'dashboard', activeTab: 'overview', editorTab: route.editorTab })}
        onInstallApp={publicBooking.onInstallApp}
      />
    );
  }

  if (route.view === 'landing') {
    return (
      <AppLoginScreen
        authDialog={authDialog}
        legalDialog={<LegalDialog pages={legalPages} panel={landing.legalPanel} onClose={() => landing.setLegalPanel(null)} />}
        user={auth.user}
        onOwnerSignIn={() => auth.openPanel('signin', 'owner')}
        onOwnerSignup={auth.onSignupOrDashboard}
        onOpenWorkspace={() => route.applyWorkspaceRoute({ view: 'dashboard', activeTab: 'overview', editorTab: route.editorTab })}
        onClientLogin={auth.onClientLogin}
        onGuestDashboard={auth.onGuestDashboard}
        onLegalPanel={landing.setLegalPanel}
      />
    );
  }

  return (
    <DashboardRouteShell
      activeTab={route.activeTab}
      mobileNavCollapsed={dashboard.mobileNavCollapsed}
      sidebarCollapsed={dashboard.sidebarCollapsed}
      overlays={{
        ...dashboard.overlays,
        authDialog,
        legalPages
      }}
      navigation={dashboard.navigation}
      routes={dashboard.routes}
    />
  );
}
