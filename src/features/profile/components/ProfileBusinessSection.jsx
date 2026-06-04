import { ProfileBusinessFaqSection } from './ProfileBusinessFaqSection';
import { ProfileBusinessMediaSection } from './ProfileBusinessMediaSection';
import { ProfileBusinessSocialSection } from './ProfileBusinessSocialSection';
import { ProfileReminderSection } from './ProfileReminderSection';

export const ProfileBusinessSection = ({
  activeProfileSection,
  onAddFaqItem,
  onCopyReferral,
  onImageCrop,
  onImageRemove,
  onImageUpload,
  onOpenStyleRoom,
  onRemoveFaqItem,
  onRemoveVenuePhoto,
  onSaveProfile,
  onSettingChange,
  onToggleFaqFeature,
  onUpdateFaqItem,
  onVenuePhotoUpload,
  referralUrl,
  settings,
  venuePhotos
}) => (
  <div data-tour="profile-business-info" className={`profile-section profile-section-business ${activeProfileSection === 'business' ? 'block' : 'hidden'} bg-white p-5 sm:p-6 md:p-10 rounded-lg border border-neutral-100 shadow-[0_25px_80px_-65px_rgba(0,0,0,0.75)]`}>
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-neutral-300 mb-3">Business Profile</p>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-black">Brand Details</h3>
      </div>
      <p className="text-sm text-neutral-400 max-w-md">These details sync into the booking page, client touchpoints, and the editor defaults.</p>
    </div>
    <div className="space-y-10">
      <ProfileBusinessMediaSection
        onImageCrop={onImageCrop}
        onImageRemove={onImageRemove}
        onImageUpload={onImageUpload}
        onOpenStyleRoom={onOpenStyleRoom}
        onRemoveVenuePhoto={onRemoveVenuePhoto}
        onVenuePhotoUpload={onVenuePhotoUpload}
        settings={settings}
        venuePhotos={venuePhotos}
      />
      <ProfileBusinessFaqSection
        onAddFaqItem={onAddFaqItem}
        onRemoveFaqItem={onRemoveFaqItem}
        onToggleFaqFeature={onToggleFaqFeature}
        onUpdateFaqItem={onUpdateFaqItem}
        settings={settings}
      />
      <ProfileReminderSection
        onSettingChange={onSettingChange}
        settings={settings}
      />
      <ProfileBusinessSocialSection
        onCopyReferral={onCopyReferral}
        onSaveProfile={onSaveProfile}
        onSettingChange={onSettingChange}
        referralUrl={referralUrl}
        settings={settings}
      />
    </div>
  </div>
);
