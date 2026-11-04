// Ajusta el proyecto Android que genera «npx cap add android»:
// - permiso de escritura para guardar en Documentos en Android 9/10
// - acceso por http a Ollama / LM Studio en tu red local
// - versión de la app tomada de package.json
const fs = require("fs");
const path = require("path");
const manifestPath = path.join(__dirname, "android", "app", "src", "main", "AndroidManifest.xml");
let xml = fs.readFileSync(manifestPath, "utf8");
const perms = [
  '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />',
  '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
];
for (const p of perms) if (!xml.includes(p.split('"')[1])) xml = xml.replace(/(<application\b)/, `${p}\n    $1`);
if (!/requestLegacyExternalStorage/.test(xml)) xml = xml.replace(/<application\b/, '<application android:requestLegacyExternalStorage="true"');
if (!/usesCleartextTraffic/.test(xml)) xml = xml.replace(/<application\b/, '<application android:usesCleartextTraffic="true"');
fs.writeFileSync(manifestPath, xml);

const gradlePath = path.join(__dirname, "android", "app", "build.gradle");
const version = require("./package.json").version;
const code = version.split(".").reduce((a, n) => a * 100 + (+n || 0), 0);
let g = fs.readFileSync(gradlePath, "utf8");
g = g.replace(/versionCode\s+\d+/, `versionCode ${code}`).replace(/versionName\s+"[^"]*"/, `versionName "${version}"`);
fs.writeFileSync(gradlePath, g);
console.log("AndroidManifest.xml y build.gradle ajustados (versión " + version + ", código " + code + ")");

// La web (www/) trae la pagina de presentacion en la raiz y la app en www/app/.
// En Android manda la app: se descarta la presentacion y www/app pasa a la raiz
// antes de que «cap sync» copie los archivos al proyecto.
const wwwDir = path.join(__dirname, "www");
const appWebDir = path.join(wwwDir, "app");
if (fs.existsSync(appWebDir)) {
  fs.rmSync(path.join(wwwDir, "index.html"), { force: true });
  fs.rmSync(path.join(wwwDir, "capturas"), { recursive: true, force: true });
  for (const name of fs.readdirSync(appWebDir)) {
    const from = path.join(appWebDir, name);
    const to = path.join(wwwDir, name);
    fs.rmSync(to, { recursive: true, force: true });
    fs.renameSync(from, to);
  }
  fs.rmdirSync(appWebDir);
  console.log("App web movida de www/app a la raiz de www para Android.");
}
