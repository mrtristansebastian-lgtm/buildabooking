import { ChevronLeft, Pencil, Pipette, RefreshCw } from 'lucide-react';

import { normalizeHexColor } from '../../../utils/theme';

export function ColourRoom({
  activeGroup,
  detectedBrandSwatches,
  groups,
  nativeAccent,
  onApplyControlColor,
  onBack,
  onNativeAccentChange,
  onResetColors,
  onSelectCategory,
  onUseBookingColors,
  scopeLabel
}) {
  if (activeGroup) {
    return (
      <div className="palette-flow-room color-system-room">
        <section
          className="editor-color-category-detail editor-color-category-screen"
          style={{
            '--editor-category-color': normalizeHexColor(
              (activeGroup.controls[0]?.value || '').slice(0, 7),
              activeGroup.controls[0]?.fallback || '#050505'
            )
          }}
        >
          <div className="editor-color-category-detail-head">
            <button
              type="button"
              className="editor-color-back-button"
              onPointerDown={onBack}
              onClick={onBack}
              aria-label="Back to colour categories"
            >
              <ChevronLeft size={15} />
              Back
            </button>
            <div>
              <span>{activeGroup.title}</span>
              <small>Tune the exact elements in this category.</small>
            </div>
          </div>
          <div className="editor-color-category-controls">
            {activeGroup.controls.map((control) => {
              const displayColor = normalizeHexColor((control.value || '').slice(0, 7), control.fallback || '#050505');
              return (
                <div
                  key={control.id}
                  className="editor-color-control-row"
                  style={{ '--editor-row-color': displayColor }}
                >
                  <span className="editor-color-drop-swatch" />
                  <div className="editor-color-control-copy">
                    <b>{control.label}</b>
                    <small>{control.note}</small>
                  </div>
                  {detectedBrandSwatches.length > 0 && (
                    <div className="editor-color-tile-options" aria-label={`${control.label} logo colour options`}>
                      {detectedBrandSwatches.slice(0, 4).map(color => {
                        const optionColor = normalizeHexColor(color, '');
                        return optionColor ? (
                          <button
                            key={`${control.id}-${optionColor}`}
                            type="button"
                            className={optionColor === displayColor ? 'is-active' : ''}
                            onClick={() => onApplyControlColor(control, optionColor)}
                            style={{ backgroundColor: optionColor }}
                            aria-label={`Set ${control.label} to ${optionColor}`}
                          />
                        ) : null;
                      })}
                    </div>
                  )}
                  <label className="editor-color-drop-plus" title={`Edit ${control.label} colour`} onClick={(event) => event.stopPropagation()}>
                    <Pencil size={13} />
                    <input
                      type="color"
                      value={displayColor}
                      onChange={(event) => onApplyControlColor(control, event.target.value)}
                      aria-label={`Edit ${control.label.toLowerCase()} colour`}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="palette-flow-room color-system-room">
      <div className="editor-color-sync-note">
        <span><Pipette size={14} /></span>
        <p>{scopeLabel ? `${scopeLabel} has its own colours.` : 'Logo colours appear as small options after brand media is uploaded.'}</p>
        {onUseBookingColors ? (
          <button type="button" onClick={onUseBookingColors}>
            <RefreshCw size={14} />
            Use Booking colours
          </button>
        ) : (
          <button type="button" onClick={onResetColors}>
            <RefreshCw size={14} />
            Reset colours
          </button>
        )}
      </div>
      {!onUseBookingColors && <div className="cinema-gradient-mode" role="group" aria-label="Accent gradient mode">
        <button type="button" onClick={() => onNativeAccentChange(true)} className={nativeAccent ? 'is-active' : ''}>
          <span>Native gradient</span>
          <small>Build A Booking glow</small>
        </button>
        <button type="button" onClick={() => onNativeAccentChange(false)} className={!nativeAccent ? 'is-active' : ''}>
          <span>Custom accents</span>
          <small>Use manual colours</small>
        </button>
      </div>}
      <div className="cinema-control-title is-compact">
        <span>Element colour board</span>
        <small>Choose a category to edit its colours.</small>
      </div>
      <div className="editor-color-category-board" aria-label="Booking page colour categories">
        {groups.map((group) => {
          const previewColors = group.controls
            .map(control => normalizeHexColor((control.value || '').slice(0, 7), control.fallback || '#050505'))
            .filter(Boolean);
          const leadColor = previewColors[0] || '#050505';
          return (
            <button
              key={group.id}
              type="button"
              className="editor-color-category-tile"
              style={{ '--editor-category-color': leadColor }}
              onClick={() => onSelectCategory(group.id)}
            >
              <div className="editor-color-category-head">
                <div>
                  <span>{group.title}</span>
                  <small>{group.controls.length} colours</small>
                </div>
                <div className="editor-color-category-preview" aria-hidden="true">
                  {previewColors.slice(0, 4).map((color, index) => (
                    <i key={`${group.id}-${color}-${index}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
