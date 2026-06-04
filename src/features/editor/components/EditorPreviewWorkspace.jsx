import { lazy, Suspense } from 'react';
import {
  Battery,
  GripVertical,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Share2,
  Signal,
  Wifi
} from 'lucide-react';
import { AppErrorBoundary } from '../../../components/AppErrorBoundary';
import { BrandLoader, LazySectionFallback } from '../../../components/AppLoading';

const BookingFlow = lazy(() => (
  import('../../../components/BookingFlow').then((module) => ({ default: module.BookingFlow }))
));

const buildPreviewPublicStaff = (staffList = []) => (
  (Array.isArray(staffList) ? staffList : [])
    .filter(staff => staff?.id && staff.accessEnabled !== false)
    .map(staff => ({
      id: staff.id,
      name: staff.name || staff.displayName || 'Team member',
      color: staff.color || '#111827',
      photoURL: staff.photoURL || ''
    }))
);

export const EditorPreviewWorkspace = ({
  containerRef,
  device,
  editorPreviewFrame,
  editorPreviewFrameClass,
  editorPreviewScrollRef,
  editorPreviewSettings,
  editorRoomNavOffset,
  editorRoomScenes,
  editorStudioModal,
  endEditorRoomNavDrag,
  handleAddToHomeScreen,
  handleBookingComplete,
  handleEditorDeviceChange,
  handleSettingChange,
  handleSettingImageUpload,
  isCompactEditorViewport,
  mobileNavCollapsed,
  moveEditorRoomNavDrag,
  openEditorRoom,
  previewKey,
  previewStep,
  scale,
  setEditorRoomNavOffset,
  setMobileNavCollapsed,
  setPreviewKey,
  setPreviewStep,
  shouldMountEditorPreview,
  showPortraitDesktopEditorPrompt,
  startEditorRoomNavDrag,
  staffList = [],
  settings
}) => {
  const previewPublicStaff = Array.isArray(editorPreviewSettings.publicStaff) && editorPreviewSettings.publicStaff.length
    ? editorPreviewSettings.publicStaff
    : buildPreviewPublicStaff(staffList);
  const bookingPreviewSettings = {
    ...editorPreviewSettings,
    publicStaff: previewPublicStaff
  };
  const previewStepLocksScroll = previewStep && previewStep !== 'select';
  const previewSteps = [
    { id: 'select', label: 'Booking' },
    { id: 'cart', label: 'Cart' },
    { id: 'details', label: 'Checkout' },
    { id: 'success', label: 'Success' }
  ];
  const handlePreviewStepChange = (stepId) => {
    setPreviewStep?.(stepId);
    requestAnimationFrame(() => {
      if (editorPreviewScrollRef?.current) {
        editorPreviewScrollRef.current.scrollTop = 0;
      }
    });
  };
  const previewScale = Math.min(
    Number.isFinite(scale) ? scale : editorPreviewFrame.maxScale,
    editorPreviewFrame.maxScale
  );

  return (
  <div ref={containerRef} className="mobile-editor-preview flex-1 bg-[#F5F5F7] flex flex-col items-center justify-center relative overflow-hidden p-6 md:p-8">
    <div className="mobile-editor-preview-toolbar absolute top-4 md:top-8 z-50">
      <div className="editor-preview-control-row">
        <div className="mobile-editor-device-switcher editor-preview-device-switcher flex bg-white/60 backdrop-blur-xl p-1.5 rounded-full border border-white/80 shadow-sm">
          <button onClick={() => handleEditorDeviceChange('desktop')} className={`mobile-editor-device-option px-8 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.4em] transition-all duration-700 ${device === 'desktop' ? 'bg-black text-white shadow-lg' : 'text-neutral-400 hover:text-black'}`}>PC</button>
          <button onClick={() => handleEditorDeviceChange('mobile')} className={`mobile-editor-device-option px-8 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.4em] transition-all duration-700 ${device === 'mobile' ? 'bg-black text-white shadow-lg' : 'text-neutral-400 hover:text-black'}`}>Mobile</button>
        </div>
        <div className="mobile-editor-device-switcher editor-preview-step-switcher flex bg-white/60 backdrop-blur-xl p-1.5 rounded-full border border-white/80 shadow-sm overflow-x-auto no-scrollbar">
          {previewSteps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => handlePreviewStepChange(step.id)}
              className={`mobile-editor-device-option px-4 md:px-5 py-2 rounded-full text-[8px] font-bold uppercase tracking-[0.28em] transition-all duration-500 whitespace-nowrap ${previewStep === step.id ? 'bg-black text-white shadow-lg' : 'text-neutral-400 hover:text-black'}`}
            >
              {step.label}
            </button>
          ))}
        </div>
        <div className="mobile-editor-toolbar-actions hidden md:flex items-center gap-2">
          <button onClick={handleAddToHomeScreen} className="mobile-editor-install-action hidden h-11 px-4 rounded-full bg-black text-white shadow-lg border border-black transition-all items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest">
            <Share2 size={15} />
            Home Screen
          </button>
          <button type="button" aria-label="Refresh booking preview" onClick={() => setPreviewKey(prev => prev + 1)} className="mobile-editor-refresh-action p-3 rounded-full bg-white text-neutral-400 hover:text-black shadow-lg border border-white/80 transition-all hidden md:block"><RefreshCw size={16} /></button>
        </div>
      </div>
    </div>

    <div className="mobile-editor-compact-controls md:hidden absolute right-4 bottom-4 z-[180] items-center gap-2 rounded-full bg-black/80 p-1.5 shadow-2xl backdrop-blur-xl border border-white/10">
      <button
        type="button"
        onClick={() => setMobileNavCollapsed(prev => !prev)}
        className={`h-10 px-3 rounded-full flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all ${mobileNavCollapsed ? 'bg-[#39FF14] text-black' : 'bg-white/10 text-white'}`}
        aria-pressed={mobileNavCollapsed}
      >
        {mobileNavCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        Nav
      </button>
    </div>

    <div
      className={`editor-preview-room-nav ${device === 'mobile' ? 'is-phone' : 'is-desktop'} ${editorRoomNavOffset.x || editorRoomNavOffset.y ? 'is-custom-position' : ''}`}
      aria-label="Preview editing rooms"
      style={{
        '--editor-room-nav-x': `${editorRoomNavOffset.x}px`,
        '--editor-room-nav-y': `${editorRoomNavOffset.y}px`
      }}
    >
      <button
        type="button"
        className="editor-preview-room-nav-grip"
        aria-label="Move editor toolbar"
        title="Drag to move toolbar. Double click to reset."
        onPointerDown={startEditorRoomNavDrag}
        onPointerMove={moveEditorRoomNavDrag}
        onPointerUp={endEditorRoomNavDrag}
        onPointerCancel={endEditorRoomNavDrag}
        onDoubleClick={() => setEditorRoomNavOffset({ x: 0, y: 0 })}
      >
        <GripVertical size={14} />
        <span>Move</span>
      </button>
      {editorRoomScenes.map((scene) => {
        const SceneIcon = scene.icon;
        const isActive = (editorStudioModal || 'introduction') === scene.id;
        return (
          <button
            key={scene.id}
            type="button"
            onClick={() => openEditorRoom(scene.id)}
            className={isActive ? 'is-active' : ''}
            title={scene.title}
          >
            <SceneIcon size={13} />
            <span>{scene.title}</span>
          </button>
        );
      })}
    </div>

    {showPortraitDesktopEditorPrompt ? (
      <div className="editor-portrait-desktop-prompt" role="status" aria-live="polite">
        <div>
          <RefreshCw size={20} />
          <span>PC mockup</span>
        </div>
        <h3>Please rotate your phone.</h3>
        <p>Landscape gives the PC preview enough room to edit without squashing the page.</p>
        <button type="button" onClick={() => handleEditorDeviceChange('mobile')}>Back to mobile</button>
      </div>
    ) : (
      <div
        style={{
          width: `${editorPreviewFrame.width}px`,
          height: `${editorPreviewFrame.height}px`,
          transform: `scale(${previewScale})`,
          transformOrigin: isCompactEditorViewport ? 'top center' : 'center center'
        }}
        className="editor-preview-mount-shell"
      >
        <div
          style={{
            width: `${editorPreviewFrame.width}px`,
            height: `${editorPreviewFrame.height}px`,
            '--booking-preview-input-color': settings.headingColor || '#050505'
          }}
          className={`editor-preview-frame ${device === 'mobile' ? 'is-mobile-preview' : 'is-desktop-preview'} relative flex flex-col shrink-0 bg-white shadow-[0_100px_200px_-50px_rgba(0,0,0,0.15)] border-black overflow-hidden ${editorPreviewFrameClass}`}
        >
          {device === 'mobile' && (
            <>
              <div className={`editor-device-status-bar absolute left-10 right-10 z-[100] flex justify-between items-center text-black font-bold tracking-tight ${isCompactEditorViewport ? 'top-4 text-[11px]' : 'top-5 text-[13px]'}`}>
                <span>9:41</span><div className="flex gap-2 items-center"><Signal size={14} /><Wifi size={14} /><Battery size={18} strokeWidth={2} /></div>
              </div>
              <div className={`absolute -left-[10px] w-1 bg-black rounded-r-lg z-[100] ${isCompactEditorViewport ? 'top-28 h-14' : 'top-32 h-16'}`} />
              <div className={`absolute -left-[10px] w-1 bg-black rounded-r-lg z-[100] ${isCompactEditorViewport ? 'top-44 h-10' : 'top-52 h-12'}`} />
              <div className={`absolute -right-[10px] w-1 bg-black rounded-l-lg z-[100] ${isCompactEditorViewport ? 'top-36 h-20' : 'top-44 h-24'}`} />
            </>
          )}

          <div className={`flex-shrink-0 border-b flex items-center justify-between editor-device-browser-bar ${device === 'desktop' ? (isCompactEditorViewport ? 'px-10 h-20 bg-neutral-50/50' : 'px-16 h-24 bg-neutral-50/50') : (isCompactEditorViewport ? 'px-7 h-20 pt-5 bg-white' : 'px-8 h-24 pt-7 bg-white')}`} style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
            <div className="flex gap-3 w-16">
              {device === 'desktop' && <><div className="w-3.5 h-3.5 rounded-full bg-red-400/80" /><div className="w-3.5 h-3.5 rounded-full bg-amber-400/80" /><div className="w-3.5 h-3.5 rounded-full bg-green-400/80" /></>}
            </div>
            <div className={`flex items-center justify-center gap-2 rounded-full bg-black/5 font-bold text-neutral-500 uppercase overflow-hidden ${device === 'desktop' ? 'px-8 py-2.5 text-[10px] tracking-[0.3em] w-1/2 max-w-[400px]' : 'px-5 py-2 text-[8px] tracking-[0.2em] max-w-[200px]'}`}>
              <span className="truncate whitespace-nowrap">/book/{settings.slug || 'studio'}</span>
            </div>
            <div className="w-16" />
          </div>

          <div
            ref={editorPreviewScrollRef}
            className={`flex-1 ${previewStepLocksScroll ? 'overflow-hidden' : 'overflow-y-auto'} overflow-x-hidden no-scrollbar relative group/simulator`}
            style={{
              backgroundColor: settings.backgroundColor,
              overscrollBehavior: previewStepLocksScroll ? 'none' : 'auto',
              overscrollBehaviorX: 'none',
              touchAction: previewStepLocksScroll ? 'none' : 'pan-y'
            }}
          >
            {shouldMountEditorPreview ? (
              <Suspense fallback={<LazySectionFallback label="Loading preview" />}>
                <AppErrorBoundary compact label="Live Preview" resetKey={previewKey}>
                  <BookingFlow
                    key={previewKey}
                    settings={bookingPreviewSettings}
                    isPreview={true}
                    previewStep={previewStep}
                    onSettingChange={handleSettingChange}
                    onMediaUpload={(key, file) => handleSettingImageUpload(key, file, 'brand')}
                    onComplete={handleBookingComplete}
                  />
                </AppErrorBoundary>
              </Suspense>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <BrandLoader label="Loading preview" />
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
  );
};
