import { useEffect } from 'react';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { supabase } from '../supabaseClient';

export function useOTAUpdater() {
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Initialize the updater
        await CapacitorUpdater.notifyAppReady();

        // 1. Get the current active version from Capgo
        const currentVersionInfo = await CapacitorUpdater.current();
        const currentVersionStr = currentVersionInfo?.version || '1.0.0';

        // 2. Fetch the latest version from Supabase
        const { data: versions, error } = await supabase
          .from('app_versions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error || !versions || versions.length === 0) return;

        const latestVersion = versions[0];
        const lastAppliedVersion = localStorage.getItem('last_ota_version');

        // 3. Compare versions
        // We check against lastAppliedVersion to prevent infinite reload loops
        // if the native Capgo plugin fails to report the new version string correctly.
        if (latestVersion.version_number !== currentVersionStr && latestVersion.version_number !== lastAppliedVersion) {
          console.log(`Update available! Current: ${currentVersionStr}, Latest: ${latestVersion.version_number}`);
          
          // Guardar intento para evitar bucles si falla catastróficamente repetidas veces
          localStorage.setItem('last_ota_version', latestVersion.version_number);

          // 4. Download the new version bundle
          const downloadRes = await CapacitorUpdater.download({
            url: latestVersion.download_url,
            version: latestVersion.version_number
          });

          // 5. Apply the update and restart the app automatically
          await CapacitorUpdater.set({ id: downloadRes.id });
        }
      } catch (err) {
        console.error('Error checking for OTA updates:', err);
      }
    };

    checkForUpdates();
  }, []);
}
