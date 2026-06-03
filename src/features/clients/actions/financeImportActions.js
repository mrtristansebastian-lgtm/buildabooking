import * as FirebaseSDK from '../../../services/firebase';
import { appId, db, isFirebaseConfigured } from '../../../services/firebase';

export function createFinanceImportActions({
  canManageWorkspace,
  setFinanceImports,
  showToast,
  user,
  workspaceOwnerId
}) {
  const saveFinanceImports = async (newList, options = {}) => {
    const silent = Boolean(options.silent);
    setFinanceImports(newList);
    if (!user || !workspaceOwnerId || !isFirebaseConfigured) return true;
    if (!canManageWorkspace) {
      if (!silent) showToast('Only owners and admins can save finance imports.');
      return false;
    }
    try {
      await FirebaseSDK.setDoc(FirebaseSDK.doc(db, 'artifacts', appId, 'users', workspaceOwnerId, 'finance', 'imports'), { list: newList, updatedAt: Date.now() });
      return true;
    } catch (error) {
      console.error('Finance import save failed', error);
      if (!silent) showToast('Finance imports could not be saved.');
      return false;
    }
  };

  return {
    saveFinanceImports
  };
}
