export const areJsonEqual = (left, right) => {
  if (left === right) return true;
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
};

export const mergeStateIfChanged = (current, incoming) => {
  const next = { ...current, ...incoming };
  return areJsonEqual(current, next) ? current : next;
};

export const stripLegacyEditorFields = (settings = {}) => {
  const {
    draftAutosavedAt,
    draftSavedAt,
    draftStatus,
    draftName,
    ...publishableSettings
  } = settings || {};
  return publishableSettings;
};
