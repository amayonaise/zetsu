use std::process::Command;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Automatically launch local Zetsu Core scraper backend in background if available
    let _ = Command::new("cmd")
        .args(&["/C", "start", "/B", "node", "d:\\zetsu-core\\dist\\server\\main.js"])
        .spawn();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running zetsu desktop application");
}
