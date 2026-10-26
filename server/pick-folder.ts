import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)

/**
 * The Windows "Select Folder" dialog (the modern IFileOpenDialog, not the old tree picker),
 * shown from PowerShell. A hidden topmost window owns it so it opens in front of the browser.
 * Prints the chosen path, or nothing when cancelled.
 */
const script = (initialDir: string) => `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @'
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

    const uint FOS_PICKFOLDERS = 0x20, FOS_FORCEFILESYSTEM = 0x40, SIGDN_FILESYSPATH = 0x80058000;

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
$owner = New-Object System.Windows.Forms.Form -Property @{ TopMost = $true; ShowInTaskbar = $false; Opacity = 0; StartPosition = 'CenterScreen'; Width = 1; Height = 1 }
$owner.Show()
$owner.Activate()
$path = [FolderPicker]::Pick($owner.Handle, '${initialDir.replace(/'/g, "''")}', 'Select project folder')
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
