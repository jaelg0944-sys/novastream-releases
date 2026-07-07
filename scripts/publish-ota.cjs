require('dotenv').config();
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están configurados en el archivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function publishUpdate() {
  try {
    console.log("🛠️ Compilando la última versión del código...");
    execSync('npm run build', { stdio: 'inherit' });

    console.log("📦 Comprimiendo archivos (ZIP)...");
    const zip = new JSZip();
    const distPath = path.join(__dirname, '../dist');
    
    if (!fs.existsSync(distPath)) {
      throw new Error("No se encontró la carpeta 'dist'. ¿Falló la compilación?");
    }

    const addFilesToZip = (dirPath, zipFolder) => {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          addFilesToZip(fullPath, zipFolder.folder(file));
        } else {
          zipFolder.file(file, fs.readFileSync(fullPath));
        }
      }
    };

    addFilesToZip(distPath, zip);
    const content = await zip.generateAsync({ type: "nodebuffer" });
    
    const versionNumber = `1.0.${Math.floor(Date.now() / 1000)}`;
    const fileName = `update_${versionNumber}.zip`;

    console.log(`☁️ Subiendo actualización a Supabase Storage (versión: ${versionNumber})...`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('updates')
      .upload(fileName, content, {
        contentType: 'application/zip',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Error subiendo a Storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('updates')
      .getPublicUrl(fileName);
      
    const downloadUrl = publicUrlData.publicUrl;

    console.log("📝 Registrando la nueva versión en la base de datos...");
    const { error: dbError } = await supabase
      .from('app_versions')
      .insert([
        { version_number: versionNumber, download_url: downloadUrl }
      ]);

    if (dbError) {
      throw new Error(`Error en base de datos: ${dbError.message}`);
    }

    console.log("✅ ¡Actualización OTA publicada con éxito!");
    console.log(`Versión: ${versionNumber}`);
    console.log("Los usuarios recibirán esta actualización la próxima vez que abran la aplicación.");

  } catch (error) {
    console.error("❌ Ocurrió un error:", error.message);
  }
}

publishUpdate();
