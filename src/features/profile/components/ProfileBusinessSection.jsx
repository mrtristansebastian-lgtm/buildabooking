import { ProfileBusinessIdentitySection } from './ProfileBusinessIdentitySection';
import { ProfileBusinessMediaSection } from './ProfileBusinessMediaSection';
import { ProfileBusinessSocialSection } from './ProfileBusinessSocialSection';
import { ProfileReminderSection } from './ProfileReminderSection';

export const ProfileBusinessSection = ({
  activeProfileSection,
  onCopyReferral,
  onImageCrop,
  onImageRemove,
  onImageUpload,
  onOpenStyleRoom,
  onRemoveVenuePhoto,
  onSaveProfile,
  onSettingChange,
  onVenuePhotoUpload,
  referralUrl,
  settings,
  venuePhotos
}) => (
  <div data-tour="profile-business-info" className={`profile-section profile-section-business ${activeProfileSection === 'business' ? 'block' : 'hidden'} bg-white p-5 sm:p-6 md:p-8 rounded-lg`}>
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
      <div>
        <p className="text-[10px] font-bold uppercase text-neutral-300 mb-3">Business profile</p>
        <h3 className="text-2xl md:text-3xl font-black text-black">Business details</h3>
      </div>
      <p className="text-sm text-neutral-500 max-w-md">Set up the public booking identity, media, client trust copy, and links in one clean flow.</p>
    </div>
    <div className="space-y-5">
      <ProfileBusinessIdentitySection
        onImageRemove={onImageRemove}
        onImageUpload={onImageUpload}
        settings={settings}
      />
      <ProfileBusinessMediaSection
        onImageCrop={onImageCrop}
        onImageRemove={onImageRemove}
        onImageUpload={onImageUpload}
        onOpenStyleRoom={onOpenStyleRoom}
        onRemoveVenuePhoto={onRemoveVenuePhoto}
        onSettingChange={onSettingChange}
        onVenuePhotoUpload={onVenuePhotoUpload}
        settings={settings}
        venuePhotos={venuePhotos}
      />
      <section className="rounded-lg bg-white">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase text-neutral-400">Client trust</p>
          <h4 className="mt-1 text-xl font-black text-black">Helpful reminders</h4>
        </div>
        <div className="space-y-4">
          <ProfileReminderSection
            onSettingChange={onSettingChange}
            settings={settings}
          />
        </div>
      </section>
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
