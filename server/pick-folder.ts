import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)

/** Shown in the dialog's title bar; the Vite server runs from the project root. */
const iconPath = path.join(process.cwd(), 'server', 'monteverdi.ico')

/** Escapes a value for a single-quoted PowerShell string. */
const quote = (value: string) => value.replace(/'/g, "''")

/**
 * The Windows "Select Folder" dialog (the modern IFileOpenDialog, not the old tree picker),
 * shown from PowerShell. A hidden topmost window owns it so it opens in front of the browser;
 * the process opts into DPI awareness so it renders crisp, and the clef replaces PowerShell's icon.
 * Prints the chosen path, or nothing when cancelled.
 */
const script = (initialDir: string) => `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
Add-Type -ReferencedAssemblies System.Windows.Forms, System.Drawing -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

public static class FolderPicker {
    [ComImport, Guid("DC1C5A9C-E88A-4dde-A5A1-60F82A20AEF7")]
    class FileOpenDialog {}

    [ComImport, Guid("42f85136-db7e-439c-85f1-e4075d135fc8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface IFileDialog {
        [PreserveSig] int Show(IntPtr parent);
        void SetFileTypes(); void SetFileTypeIndex(); void GetFileTypeIndex(); void Advise(); void Unadvise();
        void SetOptions(uint fos);
        void GetOptions(out uint fos);
        void SetDefaultFolder(IShellItem item);
        void SetFolder(IShellItem item);
        void GetFolder(); void GetCurrentSelection(); void SetFileName(); void GetFileName();
        void SetTitle([MarshalAs(UnmanagedType.LPWStr)] string title);
        void SetOkButtonLabel(); void SetFileNameLabel();
        void GetResult(out IShellItem item);
    }

    [ComImport, Guid("43826D1E-E718-42EE-BC55-A1E261C37BFE"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface IShellItem {
        void BindToHandler(); void GetParent();
        void GetDisplayName(uint sigdn, [MarshalAs(UnmanagedType.LPWStr)] out string name);
    }

    [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
    static extern void SHCreateItemFromParsingName(string path, IntPtr bindCtx, [MarshalAs(UnmanagedType.LPStruct)] Guid riid, out IShellItem item);

    [DllImport("user32.dll")] static extern bool SetProcessDpiAwarenessContext(IntPtr context);
    [DllImport("user32.dll")] static extern bool SetProcessDPIAware();
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern IntPtr FindWindow(string className, string title);
    [DllImport("user32.dll")] static extern IntPtr SendMessage(IntPtr hwnd, uint msg, IntPtr wParam, IntPtr lParam);

    const uint FOS_PICKFOLDERS = 0x20, FOS_FORCEFILESYSTEM = 0x40, SIGDN_FILESYSPATH = 0x80058000;
    const uint WM_SETICON = 0x80;

    /** Without this, Windows bitmap-stretches the dialog on scaled displays (blurry). Call before any window exists. */
    public static void UseCrispScaling() {
        try { if (SetProcessDpiAwarenessContext(new IntPtr(-4))) return; } catch { }  // per-monitor v2 (Windows 10 1703+)
        try { SetProcessDPIAware(); } catch { }
    }

    /** Swaps the dialog's title-bar icon (PowerShell's by default) for icon once the dialog appears. */
    public static System.Windows.Forms.Timer SetIconWhenShown(string title, System.Drawing.Icon icon) {
        var timer = new System.Windows.Forms.Timer { Interval = 15 };
        timer.Tick += (sender, e) => {
            var hwnd = FindWindow("#32770", title);
            if (hwnd == IntPtr.Zero) return;
            SendMessage(hwnd, WM_SETICON, new IntPtr(0), new System.Drawing.Icon(icon, 16, 16).Handle);
            SendMessage(hwnd, WM_SETICON, new IntPtr(1), new System.Drawing.Icon(icon, 32, 32).Handle);
            timer.Stop();
        };
        timer.Start();
        return timer;
    }

    public static string Pick(IntPtr owner, string initialDir, string title) {
        var dialog = (IFileDialog)new FileOpenDialog();
        uint options;
        dialog.GetOptions(out options);
        dialog.SetOptions(options | FOS_PICKFOLDERS | FOS_FORCEFILESYSTEM);
        dialog.SetTitle(title);
        if (!string.IsNullOrEmpty(initialDir)) {
            try {
                IShellItem folder;
                SHCreateItemFromParsingName(initialDir, IntPtr.Zero, typeof(IShellItem).GUID, out folder);
                dialog.SetFolder(folder);
            } catch { }
        }
        if (dialog.Show(owner) != 0) return null;
        IShellItem result;
        dialog.GetResult(out result);
        string path;
        result.GetDisplayName(SIGDN_FILESYSPATH, out path);
        return path;
    }
}
'@
[FolderPicker]::UseCrispScaling()
$title = 'Select project folder'
$owner = New-Object System.Windows.Forms.Form -Property @{ TopMost = $true; ShowInTaskbar = $false; Opacity = 0; StartPosition = 'CenterScreen'; Width = 1; Height = 1 }
$owner.Show()
$owner.Activate()
$iconTimer = $null
if (Test-Path -LiteralPath '${quote(iconPath)}') {
    $iconTimer = [FolderPicker]::SetIconWhenShown($title, (New-Object System.Drawing.Icon '${quote(iconPath)}'))
}
$path = [FolderPicker]::Pick($owner.Handle, '${quote(initialDir)}', $title)
if ($iconTimer) { $iconTimer.Stop() }
$owner.Close()
if ($path) { [Console]::Out.Write($path) }
`

/** Opens the OS folder dialog and resolves to the chosen folder, or `null` if cancelled. */
export async function pickFolder(initialDir?: string): Promise<string | null> {
  if (process.platform !== 'win32') throw new Error('The folder dialog is only wired up for Windows so far')
  const encoded = Buffer.from(script(initialDir ?? ''), 'utf16le').toString('base64')
  const { stdout } = await run('powershell.exe', ['-NoProfile', '-STA', '-NonInteractive', '-EncodedCommand', encoded], {
    timeout: 10 * 60 * 1000,
    windowsHide: true,
  })
  return stdout.trim() || null
}
