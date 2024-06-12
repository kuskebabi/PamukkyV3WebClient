using System;

using Avalonia;
using Avalonia.ReactiveUI;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using System.IO;
using System.Diagnostics;

namespace PamukkyDesktopClient.Desktop;

class Program
{
    // Initialization code. Don't use any Avalonia, third-party APIs or any
    // SynchronizationContext-reliant code before AppMain is called: things aren't initialized
    // yet and stuff might break.


    [STAThread]
    public static void Main(string[] args) {
		try {
			BuildAvaloniaApp()
				.StartWithClassicDesktopLifetime(args);
		}catch (Exception e) {
			File.WriteAllText("./crash.txt",e.ToString());
			Console.WriteLine("Saved crash log to ./crash.txt");
			Console.WriteLine(e.ToString());
			Process.Start(AppDomain.CurrentDomain.SetupInformation.ApplicationBase + "PamukkyDesktopClient.Desktop");
		}
	}

    // Avalonia configuration, don't remove; also used by visual designer.
    public static AppBuilder BuildAvaloniaApp()
        => AppBuilder.Configure<App>()
            .UsePlatformDetect()
            .WithInterFont()
            .LogToTrace()
            .UseReactiveUI();
}
