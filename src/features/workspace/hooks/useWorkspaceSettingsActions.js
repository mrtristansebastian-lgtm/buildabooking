import { createEditorSettingActions } from '../actions/editorSettingActions';
import { createWorkspacePersistenceActions } from '../actions/workspacePersistenceActions';

export function useWorkspaceSettingsActions({
  accountProfileKey,
  canManageTeam,
  canManageWorkspace,
  clearWorkspaceDirty,
  displayStaffList,
  isWorkspaceOwner,
  markWorkspaceDirty,
  personalDisplayName,
  personalProfile,
  publishedSettingsSnapshotRef,
  resetEditorPreviewScroll,
  saveStaff,
  setAccountProfileOverride,
  setSettings,
  setStaffList,
  settings,
  settingsRef,
  showToast,
  staffList,
  user,
  workspaceOwnerId
}) {
  const editorActions = createEditorSettingActions({
    markWorkspaceDirty,
    resetEditorPreviewScroll,
    setSettings,
    settings,
    showToast
  });

  const persistenceActions = createWorkspacePersistenceActions({
    accountProfileKey,
    canManageTeam,
    canManageWorkspace,
    clearWorkspaceDirty,
    displayStaffList,
    isWorkspaceOwner,
    personalDisplayName,
    personalProfile,
    publishedSettingsSnapshotRef,
    saveStaff,
    setAccountProfileOverride,
    setSettings,
    setStaffList,
    settings,
    settingsRef,
    showToast,
    staffList,
    user,
    workspaceOwnerId
  });

  return {
    ...editorActions,
    ...persistenceActions
  };
}
