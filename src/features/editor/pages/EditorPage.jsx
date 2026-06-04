import { PanelRightClose, PanelRightOpen } from 'lucide-react';

import { normalizeHexColor } from '../../../utils/theme';
import { EditorLaunchControls } from '../components/EditorLaunchControls';
import { EditorPreviewWorkspace } from '../components/EditorPreviewWorkspace';
import { EditorSettingsPanel } from '../components/EditorSettingsPanel';
import { editorRoomScenes } from '../config/editorRoomScenes';
import {
  ClientFormRoom,
  ColourRoom,
  IntroductionRoom,
  StyleDirectionRoom,
  TypographyRoom
} from '../rooms';
import {
  buildEditorColourFineTuneGroups,
  getDetectedBrandSwatches
} from '../utils/editorColourSystem';

export function EditorPage({
  actions,
  bookingPage,
  colour,
  editor,
  form,
  preview,
  settings,
  staffList = []
}) {
  const detectedBrandSwatches = getDetectedBrandSwatches(colour.detectedBrandSignal);
  const colourGroups = buildEditorColourFineTuneGroups({
    settings,
    applyColorPatch: colour.onApplyPatch
  });
  const activeColourGroup = colourGroups.find(group => group.id === colour.categoryId) || null;
  const applyControlColor = (control, color) => {
    const hex = normalizeHexColor(color, '');
    if (!control || !hex) return;
    control.onApply(hex);
    actions.showToast(`${control.label} set to ${hex}`);
  };

  return (
    <div className={`flex-1 flex overflow-hidden mobile-editor-shell editor-fullscreen-workspace editor-preview-device-${editor.device} bg-[#F5F5F7] ${editor.studioModal ? 'mobile-editor-room-open' : ''} ${editor.isPortraitMobileRuntime ? 'mobile-editor-portrait-runtime' : ''} ${editor.collapsed ? 'mobile-editor-panel-is-collapsed' : ''} ${editor.mobileNavCollapsed ? 'mobile-editor-nav-is-collapsed' : ''}`}>
      <EditorSettingsPanel
        editorCollapsed={editor.collapsed}
        editorContentRef={editor.contentRef}
        editorRoomScenes={editorRoomScenes}
        editorStudioModal={editor.studioModal}
        onCloseSettings={() => editor.setStudioModal(null)}
        openEditorRoom={actions.openRoom}
        launchControls={(
          <EditorLaunchControls
            bookingPageRoute={bookingPage.route}
            bookingPageUrl={bookingPage.url}
            copyToClipboard={bookingPage.copyToClipboard}
            editorLaunchPanel={bookingPage.launchPanel}
            onOpenBookingPage={bookingPage.onOpen}
            onSave={bookingPage.onSave}
            setEditorLaunchPanel={bookingPage.setLaunchPanel}
          />
        )}
      >
        {({ activeScene }) => (
          <>
            {activeScene.id === 'style' && (
              <StyleDirectionRoom
                value={settings.interfaceStyleDirection || 'native-precision'}
                onApply={actions.applyStyleDirection}
              />
            )}

            {activeScene.id === 'colours' && (
              <ColourRoom
                activeGroup={activeColourGroup}
                detectedBrandSwatches={detectedBrandSwatches}
                groups={colourGroups}
                nativeAccent={settings.nativeAccent}
                onApplyControlColor={applyControlColor}
                onBack={() => colour.setCategoryId('')}
                onNativeAccentChange={(value) => actions.onSettingChange('nativeAccent', value)}
                onResetColors={colour.onReset}
                onSelectCategory={colour.setCategoryId}
              />
            )}

            {activeScene.id === 'typography' && (
              <TypographyRoom
                settings={settings}
                onApplyPreset={actions.applyFontStylePreset}
              />
            )}

            {activeScene.id === 'introduction' && (
              <IntroductionRoom
                settings={settings}
                onSettingChange={actions.onSettingChange}
              />
            )}

            {activeScene.id === 'form' && (
              <ClientFormRoom
                collectsClientEmail={form.collectsClientEmail}
                collectsClientNotes={form.collectsClientNotes}
                collectsClientPhone={form.collectsClientPhone}
                emailUpdatesEnabled={form.emailUpdatesEnabled}
                settings={settings}
                onFeatureChange={actions.onFeatureChange}
              />
            )}
          </>
        )}
      </EditorSettingsPanel>

      <button
        type="button"
        onClick={() => editor.setCollapsed(!editor.collapsed)}
        aria-label={editor.collapsed ? 'Expand editor controls' : 'Collapse editor controls'}
        title={editor.collapsed ? 'Expand editor controls' : 'Collapse editor controls'}
        className="desktop-editor-panel-toggle hidden md:flex fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] w-12 h-12 bg-white border border-neutral-100 rounded-full shadow-2xl items-center justify-center text-neutral-400 hover:text-black transition-all hover:scale-110"
      >
        {editor.collapsed ? <PanelRightOpen size={20} /> : <PanelRightClose size={20} />}
      </button>

      <EditorPreviewWorkspace
        containerRef={preview.containerRef}
        device={editor.device}
        editorPreviewFrame={preview.frame}
        editorPreviewFrameClass={preview.frameClass}
        editorPreviewScrollRef={preview.scrollRef}
        editorPreviewSettings={preview.settings}
        editorRoomNavOffset={preview.roomNavOffset}
        editorRoomScenes={editorRoomScenes}
        editorStudioModal={editor.studioModal}
        endEditorRoomNavDrag={preview.endRoomNavDrag}
        handleAddToHomeScreen={actions.onAddToHomeScreen}
        handleBookingComplete={actions.onBookingComplete}
        handleEditorDeviceChange={actions.onDeviceChange}
        handleSettingChange={actions.onSettingChange}
        handleSettingImageUpload={actions.onSettingImageUpload}
        isCompactEditorViewport={preview.isCompactViewport}
        mobileNavCollapsed={editor.mobileNavCollapsed}
        moveEditorRoomNavDrag={preview.moveRoomNavDrag}
        openEditorRoom={actions.openRoom}
        previewKey={preview.key}
        scale={preview.scale}
        setEditorRoomNavOffset={preview.setRoomNavOffset}
        setMobileNavCollapsed={editor.setMobileNavCollapsed}
        setPreviewKey={preview.setKey}
        shouldMountEditorPreview={preview.shouldMount}
        showPortraitDesktopEditorPrompt={preview.showPortraitDesktopPrompt}
        startEditorRoomNavDrag={preview.startRoomNavDrag}
        staffList={staffList}
        settings={settings}
      />
    </div>
  );
}
