use std::fs::File;
use std::net::TcpStream;
use std::path::{Path, PathBuf};
use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{Manager, RunEvent};

#[allow(dead_code)]
struct BackendProcess(Arc<Mutex<Option<Child>>>);

fn is_port_in_use(port: u16) -> bool {
    TcpStream::connect_timeout(
        &format!("127.0.0.1:{}", port).parse().unwrap(),
        Duration::from_millis(300),
    )
    .is_ok()
}

fn find_backend_paths(app: &tauri::App) -> Option<(PathBuf, PathBuf, PathBuf)> {
    // 1. Try adjacent to current executable (Standard for installed NSIS and release binary)
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            let candidates = [
                parent.join("resources").join("core"),
                parent.join("core"),
            ];
            for base in &candidates {
                let node_bin = base.join("node.exe");
                let main_script = base.join("dist").join("server").join("main.js");
                if node_bin.exists() && main_script.exists() {
                    return Some((node_bin, main_script, base.clone()));
                }
            }
        }
    }

    // 2. Try finding inside Tauri resource_dir
    if let Ok(resource_dir) = app.path().resource_dir() {
        let candidates = [
            resource_dir.join("resources").join("core"),
            resource_dir.join("core"),
        ];

        for base in &candidates {
            let node_bin = base.join("node.exe");
            let main_script = base.join("dist").join("server").join("main.js");
            if node_bin.exists() && main_script.exists() {
                return Some((node_bin, main_script, base.clone()));
            }
        }
    }

    // 3. Fallback to developer workspace: d:\zetsu-core
    let dev_dir = Path::new("d:\\zetsu-core");
    let dev_script = dev_dir.join("dist").join("server").join("main.js");
    if dev_script.exists() {
        return Some((PathBuf::from("node"), dev_script, dev_dir.to_path_buf()));
    }

    None
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let child_holder: Arc<Mutex<Option<Child>>> = Arc::new(Mutex::new(None));
    let child_clone = Arc::clone(&child_holder);

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(BackendProcess(Arc::clone(&child_holder)))
        .setup(move |app| {
            // Check if Zetsu Core is already running on port 3000
            if !is_port_in_use(3000) {
                if let Some((node_exe, main_script, work_dir)) = find_backend_paths(app) {
                    println!("[Zetsu] Launching internal backend: {:?} with {:?}", node_exe, main_script);
                    let mut cmd = Command::new(&node_exe);
                    cmd.arg(&main_script);
                    cmd.current_dir(&work_dir);

                    // Redirect stdout & stderr to work_dir/core.log to avoid GUI process EBADF crashes on Windows
                    let log_path = work_dir.join("core.log");
                    if let Ok(file) = File::create(&log_path) {
                        if let Ok(err_file) = file.try_clone() {
                            cmd.stdout(file);
                            cmd.stderr(err_file);
                        }
                    }

                    #[cfg(windows)]
                    {
                        use std::os::windows::process::CommandExt;
                        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW: completely silent
                    }

                    match cmd.spawn() {
                        Ok(child) => {
                            if let Ok(mut lock) = child_clone.lock() {
                                *lock = Some(child);
                            }
                            println!("[Zetsu] Internal backend process started successfully");
                        }
                        Err(e) => {
                            eprintln!("[Zetsu] Failed to spawn backend process: {}", e);
                        }
                    }
                } else {
                    eprintln!("[Zetsu] Could not locate backend files");
                }
            } else {
                println!("[Zetsu] Backend already online on port 3000");
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building zetsu desktop application");

    let exit_child_holder = Arc::clone(&child_holder);
    app.run(move |_app_handle, event| {
        if let RunEvent::Exit = event {
            if let Ok(mut lock) = exit_child_holder.lock() {
                if let Some(mut child) = lock.take() {
                    println!("[Zetsu] Shutting down internal backend process...");
                    let _ = child.kill();
                }
            }
        }
    });
}
