// Zetsu desktop shell.
//
// The Zetsu Core resolver backend is hosted on a VPS and reached over HTTPS by
// the frontend (see `DEFAULT_BACKEND_URL` in `src/services/storage.ts`), so this
// binary is a pure UI shell: no bundled Node runtime, no spawned local server.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .build(tauri::generate_context!())
        .expect("error while building zetsu desktop application")
        .run(|_app_handle, _event| {});
}