import { Grid2X2, ListCollapse } from 'lucide-react';

const serviceLayouts = [
  {
    id: 'dropdown',
    icon: ListCollapse,
    title: 'Dropdown',
    copy: 'A compact polished selector for simple booking flows.'
  },
  {
    id: 'tiles',
    icon: Grid2X2,
    title: 'Tiles',
    copy: 'Category tabs with service tiles for browsing.'
  }
];

export function ServicesRoom({ settings, onSettingChange }) {
  const activeLayout = settings.serviceDropdownEnabled === false ? 'tiles' : 'dropdown';

  const applyLayout = (layoutId) => {
    if (layoutId === 'tiles') {
      onSettingChange('serviceDropdownEnabled', false);
      onSettingChange('serviceDisplayStyle', 'tiles');
      return;
    }
    onSettingChange('serviceDropdownEnabled', true);
    onSettingChange('serviceDisplayStyle', 'compact');
  };

  return (
    <div className="style-direction-suite services-layout-room">
      <div className="style-direction-grid services-layout-grid">
        {serviceLayouts.map((layout) => {
          const Icon = layout.icon;
          const isActive = activeLayout === layout.id;
          return (
            <button
              key={layout.id}
              type="button"
              onClick={() => applyLayout(layout.id)}
              className={isActive ? 'is-active' : ''}
              aria-pressed={isActive}
            >
              <i className={`services-layout-preview services-layout-preview-${layout.id}`} aria-hidden="true">
                <Icon size={18} />
                <b />
                <b />
                <b />
              </i>
              <strong>{layout.title}</strong>
              <small>{layout.copy}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
