# Constela

**Muchas IA, ninguna clave.** Un chat que reúne modelos de IA gratuitos de la nube, de tu PC y de tu navegador, sin pedirte ninguna API key. Funciona como web (GitHub Pages), como programa de Windows (.exe) y como app de Android (.apk), todo desde el mismo código.

## Qué hace

- **Tres modos de trabajo** (botón de arriba a la derecha):
  - **Automático**: mira qué pides (código, búsqueda en internet, escritura, cálculo, documentos, imágenes adjuntas…) y se lo pasa a la IA más adecuada que tengas disponible.
  - **Equipo**: una IA coordinadora divide el encargo en subtareas, cada una la resuelve la IA más adecuada (dos a la vez) y al final otra IA junta todo en una sola respuesta.
  - **Una sola IA**: siempre el modelo que elijas.
  - En los tres modos, si una IA falla o llega a su límite, responde la siguiente (respaldo automático).
- **Archivos de verdad**: Word (.docx), PDF, Excel (.xlsx, con fórmulas y varias hojas), PowerPoint (.pptx), páginas web, código, CSV… con vista previa y descarga. Varios archivos se bajan juntos en .zip.
- **Imágenes**: las IAs pueden dibujar (Pollinations, Puter o Perchance), y hay un «modo imagen» para dibujar directamente.
- **Herramientas** que las IAs usan solas: buscar en la web, leer páginas, Wikipedia, ejecutar JavaScript y Python (con gráficos y archivos de salida), calculadora, fecha y hora, clima y memoria.
- **Adjuntos**: PDF, Word, Excel, PowerPoint, imágenes, código y texto.
- Proyectos con instrucciones propias, búsqueda de chats, edición de mensajes, lectura en voz alta, dictado, tema claro/oscuro, copias de seguridad.

## Proveedores (ninguno pide API key)

| Proveedor | Qué necesitas | Notas |
|---|---|---|
| **Pollinations** | Nada | Anónimo. ~1 mensaje cada 15 s; si te pasas, Constela espera y reintenta. |
| **LLM7** | Nada | Anónimo. Mensajes de hasta ~8.000 caracteres (Constela recorta el historial). |
| **Puter** | Una cuenta gratis de Puter (botón «Conectar») | Más de 400 modelos: GPT, Claude, Gemini, Grok, DeepSeek… Trae saldo gratis mensual; los modelos grandes lo gastan antes. |
| **Ollama (+ nube)** | Ollama instalado en tu PC | Modelos locales y los `:cloud` de Ollama tras ejecutar `ollama signin` una vez. |
| **Servidor local** | LM Studio, llama.cpp, Jan… | Cualquier servidor compatible con OpenAI. |
| **AI Horde** | Nada | Red comunitaria; va por cola y puede tardar. |
| **Perchance** | Nada (abre su web) o un «puente» para usarla dentro del chat | Ver la sección Perchance. |
| **En el navegador (WebLLM)** | Una GPU y Chrome/Edge recientes | El modelo se descarga una vez y funciona sin internet. |
| **Gemini Nano** | Chrome con la IA integrada | Sólo si tu Chrome la ofrece. |
| **OVHcloud** | Nada | Experimental, ~2 mensajes por minuto. |

Estos servicios son gratuitos y de terceros: pueden cambiar sus límites o dejar de funcionar. Por eso existe el respaldo automático.

## Publicarlo en GitHub (web + .exe + .apk)

1. Crea un repositorio nuevo en GitHub (puede ser público o privado).
2. Sube **todo el contenido de esta carpeta**, incluida la carpeta `.github` (en la web de GitHub: *Add file › Upload files* y arrastra todo; o con GitHub Desktop).
3. Activa la web: *Settings › Pages › Build and deployment › Source:* **GitHub Actions**.
4. Ve a la pestaña **Actions**: el flujo «Compilar Constela» se ejecuta solo (tarda ~10 min). Al terminar:
   - La web queda en `https://TU-USUARIO.github.io/TU-REPO/`.
   - En la ejecución, abajo en **Artifacts**, descargas **Constela-Windows** (instalador y versión portable) y **Constela-Android** (el .apk).
5. Para una versión «oficial» con los instaladores adjuntos: *Releases › Draft a new release*, crea la etiqueta `v1.0.0` y publícala. Los archivos se añaden solos a esa Release en unos minutos.

### Firma de Android (para actualizar sin desinstalar)

Junto a este proyecto recibiste `LEEME-firma-android.txt` y `constela-firma.jks`. Crea los 3 secretos que indica ese archivo en *Settings › Secrets and variables › Actions*. Así cada .apk nuevo se instala encima del anterior sin perder tus chats. **No subas esos dos archivos al repositorio.** Sin los secretos el .apk funciona igual, pero cada versión nueva pedirá desinstalar la anterior.

## Windows

- **Constela-Setup-x.y.z.exe** instala la app con acceso directo; **Constela-Portable-x.y.z.exe** se ejecuta sin instalar.
- Como no está firmada con un certificado de pago, Windows SmartScreen puede avisar: *Más información › Ejecutar de todas formas*.
- **Descargas**: al pulsar «Descargar» se abre la ventana «Guardar como» (empieza en tu carpeta Descargas) y el aviso permite abrir la carpeta.
- La búsqueda web y la lectura de páginas van directas, sin proxies. Ollama funciona sin configurar CORS.

## Android

- Copia el .apk al teléfono y ábrelo; Android pedirá permitir «instalar apps de origen desconocido» para tu navegador o gestor de archivos.
- **Descargas**: se guardan en **Documentos/Constela**. Desde el aviso puedes abrirlas o compartirlas (WhatsApp, Drive, Archivos…). Si ya existe un archivo con el mismo nombre, se crea `nombre (1).ext` en lugar de sobrescribirlo.
- La búsqueda web y la lectura de páginas usan la red nativa del teléfono.
- **Puter en Android**: su inicio de sesión abre una ventana emergente que puede no funcionar dentro de la app. Si no conecta, usa Puter desde la web o desde Windows; los demás proveedores funcionan igual.
- Para usar Ollama de tu PC desde el móvil: en el PC arranca Ollama con `OLLAMA_HOST=0.0.0.0` y `OLLAMA_ORIGINS="*"`, y en Ajustes › Proveedores pon `http://IP-DE-TU-PC:11434`.

## Ollama y sus modelos en la nube

1. Instala Ollama en tu PC y ejecuta `ollama signin` una vez (cuenta gratis de ollama.com).
2. En Constela elige cualquier modelo terminado en `:cloud` (por ejemplo `gpt-oss:120b-cloud` o `qwen3-coder:480b-cloud`). También puedes escribir el nombre de cualquier modelo en el buscador del selector.
3. **En la versión web** el navegador necesita que Ollama acepte la página: ciérralo y arráncalo con la variable `OLLAMA_ORIGINS="*"`. En la app de Windows no hace falta.

## Perchance

Hay dos formas de usarlo (se cambia en *Ajustes › Perchance*):

- **Abrir su web** (por defecto, sin configurar nada): al elegir Perchance se abre tu enlace (por defecto `https://perchance.org/minimal#edit`, cámbialo por el que quieras) a pantalla completa dentro de Constela y trabajas directamente en su web. «Volver al chat» te regresa. En la app de Windows siempre se muestra dentro; si en otro sitio no carga, usa el botón «Navegador».
- **Integrada en el chat**: Perchance responde dentro del chat como cualquier otra IA, dibuja imágenes para el chat y la usan los modos Automático y Equipo. Requiere crear una vez un generador «puente»:
  1. Abre `https://perchance.org/minimal#edit`.
  2. Pega en el panel izquierdo y en el derecho los dos bloques de código que aparecen en *Ajustes › Perchance* (con botón «Copiar»).
  3. Pulsa *Save*, ponle un nombre propio y pega el enlace en Constela. Pulsa «Probar».

Además, la sección Perchance de la barra lateral abre sus herramientas (chat de personajes, texto a imagen, historias…) dentro de la app; añade cualquier otro generador con el «+».

## Cambiar el nombre de la app

El nombre aparece en: `www/index.html` (busca `const APP_NAME = "Constela"` y `<title>`), `www/manifest.webmanifest`, `desktop/package.json` (`productName`) y `mobile/capacitor.config.json` (`appName`).

## Tus datos

Todo (chats, archivos, ajustes, memoria) se guarda sólo en el dispositivo. Usa *Ajustes › Datos y memoria › Exportar todo* para hacer copias. Los mensajes viajan al proveedor de IA que responde en cada caso.
