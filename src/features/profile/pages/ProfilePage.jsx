import { ProfileAccountControls } from '../components/ProfileAccountControls';
import { ProfileActionStrip } from '../components/ProfileActionStrip';
import { ProfileActivitySection } from '../components/ProfileActivitySection';
import { ProfileBillingSection } from '../components/ProfileBillingSection';
import { ProfileBusinessSection } from '../components/ProfileBusinessSection';
import { ProfileMigrationSection } from '../components/ProfileMigrationSection';
import { ProfileMobileHub } from '../components/ProfileMobileHub';
import { ProfilePersonalSection } from '../components/ProfilePersonalSection';

export const ProfilePage = ({
  activeProfileSection,
  activeProfileSectionMeta,
  authBusy,
  canManageWorkspace,
  copyToClipboard,
  handleClearCsvMigrationData,
  handleCsvMigrationImport,
  handlePersonalProfilePhotoUpload,
  handleSettingChange,
  handleSettingImageUpload,
  handleSignOut,
  handleVenuePhotoUpload,
  importedMigrationCounts,
  isGuestWorkspace,
  keepLoggedIn,
  onDeleteAccount,
  openBillingAction,
  openOwnerAuth,
  openSettingImageCrop,
  personalDisplayName,
  personalProfile,
  profileActivityPrimaryCount,
  profileActivityRows,
  profileActivitySecondaryCount,
  profileSections,
  profileSystemFilter,
  profileSystemFilterOptions,
  referralUrl,
  removeFaqItem,
  removePersonalProfilePhoto,
  removeSettingImage,
  removeVenuePhoto,
  saveProfileChanges,
  setActiveProfileSection,
  setKeepLoggedIn,
  setProfileSystemFilter,
  setShowOwnerManual,
  settings,
  showToast,
  toggleFaqFeature,
  updateFaqItem,
  addFaqItem,
  updatePersonalProfile,
  user,
  venuePhotos,
  workspaceOwnerId,
  workspaceRole,
  handleProfileActivityOpen,
  onOpenStyleRoom
}) => (
  <div className="profile-page flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-12 relative bg-white">
    <ProfileActionStrip
      isGuestWorkspace={isGuestWorkspace}
      onOpenOwnerAuth={openOwnerAuth}
      onOpenOwnerManual={() => setShowOwnerManual(true)}
      onSaveProfile={saveProfileChanges}
    />

    <ProfileMobileHub
      activeProfileSection={activeProfileSection}
      activeProfileSectionMeta={activeProfileSectionMeta}
      onSetActiveProfileSection={setActiveProfileSection}
      profileSections={profileSections}
    />

    <div className="max-w-6xl space-y-8">
      <ProfilePersonalSection
        activeProfileSection={activeProfileSection}
        isGuestWorkspace={isGuestWorkspace}
        onOpenOwnerAuth={openOwnerAuth}
        onPhotoUpload={handlePersonalProfilePhotoUpload}
        onRemovePhoto={removePersonalProfilePhoto}
        personalDisplayName={personalDisplayName}
        personalProfile={personalProfile}
        updatePersonalProfile={updatePersonalProfile}
        user={user}
        workspaceRole={workspaceRole}
      />
      <ProfileAccountControls
        activeProfileSection={activeProfileSection}
        authBusy={authBusy}
        isGuestWorkspace={isGuestWorkspace}
        keepLoggedIn={keepLoggedIn}
        onDeleteAccount={onDeleteAccount}
        onSignOut={handleSignOut}
        onToggleKeepLoggedIn={setKeepLoggedIn}
      />
      <ProfileActivitySection
        activeProfileSection={activeProfileSection}
        onActivityOpen={handleProfileActivityOpen}
        onSystemFilterChange={setProfileSystemFilter}
        profileActivityPrimaryCount={profileActivityPrimaryCount}
        profileActivityRows={profileActivityRows}
        profileActivitySecondaryCount={profileActivitySecondaryCount}
        profileSystemFilter={profileSystemFilter}
        profileSystemFilterOptions={profileSystemFilterOptions}
      />
      <ProfileMigrationSection
        activeProfileSection={activeProfileSection}
        canManageWorkspace={canManageWorkspace}
        displayCurrency={settings.currency || 'ZAR'}
        importedMigrationCounts={importedMigrationCounts}
        onClearMigrationData={handleClearCsvMigrationData}
        onImportMigrationCsv={handleCsvMigrationImport}
        showToast={showToast}
        workspaceOwnerId={workspaceOwnerId}
      />
      <ProfileBillingSection
        activeProfileSection={activeProfileSection}
        onBillingAction={openBillingAction}
      />
      <ProfileBusinessSection
        activeProfileSection={activeProfileSection}
        onAddFaqItem={addFaqItem}
        onCopyReferral={copyToClipboard}
        onImageCrop={openSettingImageCrop}
        onImageRemove={removeSettingImage}
        onImageUpload={handleSettingImageUpload}
        onOpenStyleRoom={onOpenStyleRoom}
        onRemoveFaqItem={removeFaqItem}
        onRemoveVenuePhoto={removeVenuePhoto}
        onSaveProfile={saveProfileChanges}
        onSettingChange={handleSettingChange}
        onToggleFaqFeature={toggleFaqFeature}
        onUpdateFaqItem={updateFaqItem}
        onVenuePhotoUpload={handleVenuePhotoUpload}
        referralUrl={referralUrl}
        settings={settings}
        venuePhotos={venuePhotos}
      />
    </div>
  </div>
);
