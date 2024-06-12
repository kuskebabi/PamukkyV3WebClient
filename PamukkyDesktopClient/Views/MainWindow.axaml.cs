using AsyncImageLoader;
using Avalonia.Animation;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Media.Imaging;
using Avalonia.Threading;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Avalonia.Logging;
using System.Threading.Tasks;
using DynamicData;
using System.Linq;
using System.Globalization;
using Avalonia;
using Avalonia.Themes.Fluent;
using Avalonia.Media;
using System.Diagnostics;
using Avalonia.Input.Platform;
using Avalonia.Animation.Easings;
using System.Net;
using System.Runtime.InteropServices;
using System.Web;

namespace PamukkyDesktopClient.Views;

public partial class MainWindow : Window
{
	HttpClient mainclient;
	string serverurl = "";
	Dictionary<string, string> authinfo = new();
	Dictionary<string, string> userprofile;
	List<Dictionary<string, object>> chatslist = new();
	ToggleButton? selecteditm = null;
	MainView mainv;
	DispatcherTimer onlinetmr;
	DispatcherTimer chatupdatetmr;
	string currentchatid = "";
	string lastrecvmsg = "";
	string currentchatr = "";
    string[] reactions = ["👍", "👎", "😃", "😂", "👏", "😭", "💛", "🤔", "🎉"];
	bool ishidden = false;
	bool isappwin = false;
	bool shownotifications = true;
    IClipboard clipboard;
    Window notar = new();
    StackPanel notcont = new() { Orientation = Avalonia.Layout.Orientation.Vertical };
	Dictionary<string, object> data = new();
	Dictionary<string, ulistitem> chatslisttb = new();
	Action<Dictionary<string, object>> loch;
	Dictionary<String, Object> curole;
	Dictionary<string, object> aalr = new() 
				{
					{ "AllowMessageDeleting", true },
					{ "AllowEditingUsers", false },
					{ "AllowEditingSettings", false },
					{ "AllowKicking", false },
					{ "AllowBanning", true },
					{ "AllowSending", true },
					{ "AllowSendingReactions", true },
				};

    public MainWindow()
	{
		InitializeComponent();
		clipboard = this.Clipboard;

        Logger.TryGet(LogEventLevel.Fatal, LogArea.Control)?.Log(this, "Avalonia Infrastructure");
		DispatcherTimer dt = new() { Interval = TimeSpan.FromSeconds(2) };
		dt.Tick += (a, ba) => {
			loaddata();

            var ticon = TrayIcon.GetIcons(Application.Current)[0];

            var timenu = ticon.Menu;
            NativeMenuItem showpamukky = new() { Header = "Show Pamukky" };
            NativeMenuItem recvtotifs = new() { Header = (shownotifications ? "Hide" : "Show") + " Notifications" };
            NativeMenuItem quit = new() { Header = "Quit" };
            timenu.Items.Add(showpamukky);
            timenu.Items.Add(recvtotifs);
            timenu.Items.Add(quit);

            bool isexiting = false;
            Closing += (s, e) => {
				savedata();
                if (!isexiting)
                {
                    e.Cancel = true;
                    Hide();
                    ishidden = true;
                }else
				{
					notar.Close();
				}
            };

            showpamukky.Click += (e, a) =>
            {
                Show();
				Activate();
				ishidden = false;
            };
            recvtotifs.Click += (e, a) =>
            {
				shownotifications = !shownotifications;

                recvtotifs.Header = (shownotifications ? "Hide" : "Show") + " Notifications";

            };
            quit.Click += (e, a) =>
            {
                isexiting = true;
                Close();
			};

			bool launchedforchat = false;

			Deactivated += (e, a) => {
				if (isappwin)
				{
                    ishidden = false;
                }
                else
				ishidden = true;
			};

            Activated += (e, a) => {
                if (selecteditm != null && launchedforchat == false && ishidden == true)
                {
                    foreach (Dictionary<string, object> itm in chatslist)
                    {
                        if (itm["chatid"].ToString() == currentchatid)
                        {
                            loch(itm);
                        }
                    }

                }
                launchedforchat = false;
                ishidden = false;
				
            };

            ScrollViewer nl = new() { Content = notcont};

			
            notar.Background = Brushes.Transparent;
            notar.SystemDecorations = SystemDecorations.None;
            notar.ExtendClientAreaToDecorationsHint = true;
            notar.CanResize = false;
			notar.Topmost = true;
            notar.SizeToContent = SizeToContent.Height;
			notar.Width = 284;
            notar.ExtendClientAreaChromeHints = Avalonia.Platform.ExtendClientAreaChromeHints.NoChrome;
            notar.ExtendClientAreaTitleBarHeightHint = -1;
            notar.ShowInTaskbar = false;

            notar.Content = nl;
            notar.Show();

            posnotar();

            List<string> recvn = new();
            mainclient = new HttpClient();
			onlinetmr = new() { Interval = TimeSpan.FromSeconds(3) };
			onlinetmr.Tick += (e, a) =>
			{
				posnotar();
                if (shownotifications) {
                    StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"] }));
                    var task = mainclient.PostAsync(Path.Combine(serverurl, "getnotifications"), sc);
                    task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
                    {
                        try
                        {
                            Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
                            Task continuation = task.ContinueWith(t =>
                            {
                                if (t.IsCompletedSuccessfully)
                                {
                                    Dispatcher.UIThread.Post(() =>
                                    {
                                        Dictionary<string, Dictionary<string, object>> result = new();
                                        try
                                        {
                                            result = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, object>>>(t.Result);
                                        }
                                        catch { }
                                        foreach (KeyValuePair<string, Dictionary<string, object>> entry in result)
										{
											if (!recvn.Contains(entry.Key))
											{
												var notif = entry.Value;
												if (currentchatid != notif["chatid"].ToString() || ishidden)
												{
													ntif nt = new();
													
													nt.title.Content = ((JObject)notif["user"])["name"].ToString();
													nt.content.Content = notif["content"].ToString();
                                                    try
                                                    {
                                                        var task = ImageLoader.AsyncImageLoader.ProvideImageAsync(((JObject)notif["user"])["picture"].ToString().Replace("%SERVER%", serverurl));
                                                        var cnting = task.ContinueWith((Task<Bitmap?> bt) =>
                                                        {
                                                            var image = bt.Result;
                                                            if (image != null)
                                                            {
                                                                Dispatcher.UIThread.Post(() => nt.pfp.Source = image);
                                                            }
                                                        });
                                                    }
                                                    catch { }
                                                    DispatcherTimer timeout = new() { Interval = TimeSpan.FromSeconds(10) };
                                                    timeout.Tick += (a, ba) => {
                                                        notcont.Children.Remove(nt);
                                                        posnotar();
                                                        timeout.Stop();
                                                    };
                                                    timeout.Start();
                                                    nt.btn.Click += (e, a) => {
														launchedforchat = true;
                                                        foreach (Dictionary<string, object> itm in chatslist)
                                                        {
                                                            if (itm["chatid"].ToString() == notif["chatid"].ToString())
                                                            {
                                                                loch(itm);
                                                            }
                                                        }
                                                        Show();
                                                        Activate();
                                                        ishidden = false;
                                                        notcont.Children.Remove(nt);
                                                        posnotar();
                                                        timeout.Stop();
                                                    };
                                                    nt.closebtn.Click += (e, a) =>
													{
														notcont.Children.Remove(nt);
														posnotar();
                                                        timeout.Stop();
													};
                                                    
                                                    notcont.Children.Add(nt);

                                                    DispatcherTimer dt = new() { Interval = TimeSpan.FromMilliseconds(200) };
                                                    dt.Tick += (a, ba) => {
                                                        posnotar();
                                                        dt.Stop();
                                                    };
                                                    dt.Start();
                                                    
                                                }
												recvn.Add(entry.Key);
											}
										}

                                    }, DispatcherPriority.Normal);
                                }
                            });
                        }
                        catch { }
                    });
                }
                if (!ishidden)
				{
					{
						StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"] }));
						var task = mainclient.PostAsync(Path.Combine(serverurl, "setonline"), sc);
						task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
						{
							try
							{
								Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
								Task continuation = task.ContinueWith(t =>
								{
									if (!t.IsCompletedSuccessfully)
									{
										Dispatcher.UIThread.Post(() =>
										{
											loadloginview();
										}, DispatcherPriority.Normal);

									}
								});
							}
							catch (Exception e)
							{
								Dispatcher.UIThread.Post(() =>
								{
									loadloginview();
								}, DispatcherPriority.Normal);
							}
						});
					}
					//int citemscountvis = (int)(this.Height / 60);
					//int startitm = (int)((mainv.chatslistscroll.Offset.Y - 60) / 60);
					//int enditm = (startitm + citemscountvis > chatslist.Count ? chatslist.Count : startitm + citemscountvis);
					////System.Diagnostics.Debug.WriteLine(startitm);
					////System.Diagnostics.Debug.WriteLine(citemscountvis);
					////System.Diagnostics.Debug.WriteLine(enditm);
					//for (int i = startitm; i < enditm; i++)
					//{
					//	try
					//	{
					//		ulistitem ul = (ulistitem)mainv.chatslist.Children[i];
					//		string chatid = chatslist[i]["chatid"].ToString();
					//		{
					//			StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], chatid = chatslist[i]["chatid"] }));
					//			var task = mainclient.PostAsync(Path.Combine(serverurl, "getlastmessage"), sc);
					//			task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
					//			{
					//				try
					//				{
					//					Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
					//					Task continuation = task.ContinueWith(t =>
					//					{
					//						if (t.IsCompletedSuccessfully)
					//						{
					//							Dispatcher.UIThread.Post(() =>
					//							{
					//								Dictionary<string, object> result = JsonConvert.DeserializeObject<Dictionary<string, object>>(t.Result);
					//								if (result != null)
					//								{
					//									if (!(result.ContainsKey("status") && result["status"].ToString() == "error"))
					//									{
					//										Dispatcher.UIThread.Post(() =>
					//										{
					//											ul.mcontent.Content = result["content"].ToString().Split("\n")[0];
					//											DateTime dt = DateTime.ParseExact(result["time"].ToString(), "MM dd yyyy, HH:mm zzz", CultureInfo.InvariantCulture);
					//											if (dt.Date == DateTime.Now.Date)
					//											{
					//												ul.mtime.Content = addleading(dt.Hour) + ":" + addleading(dt.Minute);
					//											}
					//											else
					//											{
					//												ul.mtime.Content = dt.Year.ToString() + "/" + dt.Month.ToString() + "/" + dt.Day.ToString() + " " + addleading(dt.Hour) + ":" + addleading(dt.Minute);
					//
					//											}
					//										}, DispatcherPriority.Normal);
					//									}
					//								}
					//							}, DispatcherPriority.Normal);
					//						}
					//					});
					//				}
					//				catch { }
					//			});
					//		}
					//
					//
					//
					//		
					//
					//		if (chatslist[i]["type"].ToString() == "user")
					//		{
					//			string uid = chatslist[i]["user"].ToString();
					//			StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], uid = uid }));
					//			var task = mainclient.PostAsync(Path.Combine(serverurl, "getonline"), sc);
					//			task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
					//			{
					//				try
					//				{
					//					Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
					//					Task continuation = task.ContinueWith(t =>
					//					{
					//						if (t.IsCompletedSuccessfully)
					//						{
					//							Dispatcher.UIThread.Post(() =>
					//							{
					//								if (t.Result == "Online")
					//								{
					//									ul.onlinedot.IsVisible = true;
					//									if (currentchatid == chatid)
					//									{
					//										mainv.chatarea.ilbl.Content = "Online";
					//									}
					//								}
					//								else
					//								{
					//									ul.onlinedot.IsVisible = false;
					//									if (currentchatid == chatid)
					//									{
					//										try
					//										{
					//											DateTime dt = DateTime.ParseExact(t.Result, "MM dd yyyy, HH:mm zzz", CultureInfo.InvariantCulture);
					//											if (dt.Date == DateTime.Now.Date)
					//											{
					//												mainv.chatarea.ilbl.Content = "Last Seen: " + addleading(dt.Hour) + ":" + addleading(dt.Minute);
					//											}
					//											else
					//											{
					//												mainv.chatarea.ilbl.Content = "Last Seen: " + dt.Year.ToString() + "/" + dt.Month.ToString() + "/" + dt.Day.ToString() + " " + addleading(dt.Hour) + ":" + addleading(dt.Minute);
					//											}
					//										}
					//										catch { }
					//									}
					//								}
					//							}, DispatcherPriority.Normal);
					//						}
					//					});
					//				}
					//				catch { }
					//			});
					//		}
					//	}
					//	catch { }
					//};
				};
			};
			mainclient = new HttpClient();
			chatupdatetmr = new() { Interval = TimeSpan.FromSeconds(1) };
            
            chatupdatetmr.Tick += (e, a) =>
			{

                StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], id = currentchatid }));
                var task = mainclient.PostAsync(Path.Combine(serverurl, "getupdates"), sc);
                task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
                {
                    try
                    {
                        Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
                        Task continuation = task.ContinueWith(t =>
                        {
                            if (t.IsCompletedSuccessfully)
                            {
                                Dispatcher.UIThread.Post(() =>
                                {
									Dictionary<string, Dictionary<string, object>> result = new();
                                   try
                                    {
										result = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, object>>>(t.Result);
                                    }
                                    catch { }

                                    foreach (KeyValuePair<string, Dictionary<string, object>> entry in result)
                                    {
										// do something with entry.Value or entry.Key
										String v = entry.Value["event"].ToString();

                                        if (v == "NEWMESSAGE")
										{
											addmessage(entry.Key,entry.Value);
                                            mainv.chatarea.chatmainscroll.ScrollToEnd();
                                            lastrecvmsg = entry.Key;
                                        }
                                        if (v == "DELETED")
                                        {
                                            mainv.chatarea.msgkeys.Remove(entry.Key);
                                            mainv.chatarea.chatmain.Children.Remove(mainv.chatarea.keymsgcont[entry.Key]);
                                        }
                                        if (v == "REACTIONS")
                                        {
											initreactions(mainv.chatarea.keymsgcont[entry.Key].mreactions, (Dictionary<string, object>)JObjectConverter.ConvertJObjectToDictionary((JObject)entry.Value["rect"]),entry.Key);
                                            
                                        }
                                    }
                                    

                                }, DispatcherPriority.Normal);
                            }
                        });
                    }
                    catch { }
                });

            };

			if (serverurl != "")
			{
				if (authinfo.ContainsKey("token"))
				{
					loadmainview();
				}
				else
					loadloginview();
			}else
				loadconnectview();
			dt.Stop();
		};
		dt.Start();
	}

	void loaddata()
	{
        if (!File.Exists("./DATA.JSON"))
        {
            File.Create("./DATA.JSON").Close();
        }
        data = JsonConvert.DeserializeObject<Dictionary<string, object>>(File.ReadAllText("./DATA.JSON"));
		if (data == null)
		{
			data = new Dictionary<string, object>();
		}
		if (!data.ContainsKey("server"))
		{
			data["server"] = "";
        }else
		{
			serverurl = data["server"].ToString();

        }
		if (!data.ContainsKey("shownotifications"))
		{
			data["shownotifications"] = true;
        }

		if (data.ContainsKey("logininfo"))
		{
			if (((JObject)data["logininfo"]).ContainsKey("token"))
			{
                authinfo["token"] = ((JObject)data["logininfo"])["token"].ToString();
                authinfo["uid"] = ((JObject)data["logininfo"])["uid"].ToString();
            }
			
        }

		shownotifications = (bool)data["shownotifications"];
    }

	void savedata()
	{
		data["shownotifications"] = shownotifications;
		data["server"] = serverurl;
		data["logininfo"] = authinfo;

		File.WriteAllText("./DATA.JSON", JsonConvert.SerializeObject(data));
	}

	void posnotar()
	{
        Avalonia.Platform.Screen cscreen = Screens.Primary;
        PixelRect bounds = cscreen.WorkingArea;
        
		notar.MaxHeight = bounds.Height;
		if (notcont.Children.Count == 0)
		{
            notar.Position = new PixelPoint(9999, 9999);
            notar.Opacity = 0;
        }
        else
		{
			notar.Opacity = 1;
            notar.Position = new PixelPoint(bounds.Right - 284, bounds.Bottom - (int)notar.Height);
        }
    }

	void loadconnectview()
	{
		connectview cv = new();
		cv.utb.Text = serverurl;
		cv.cbtn.Click += (e, a) => {
			cv.elbl.Content = null;
			cv.cbtn.IsEnabled = false;
			try
			{
				var task = mainclient.GetAsync(Path.Combine(cv.utb.Text, "ping"));
				task.ContinueWith((Task<HttpResponseMessage> httpTask) => {
					try
					{
						Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
						Task continuation = task.ContinueWith(t =>
						{
							if (t.IsCompletedSuccessfully)
							{
								Dispatcher.UIThread.Post(() => {
									serverurl = cv.utb.Text;
									loadloginview();
								}, DispatcherPriority.Normal);
							}
							else
							{
								Dispatcher.UIThread.Post(() => {
									cv.elbl.Content = "Failled Connecting";
									cv.cbtn.IsEnabled = true;
								}, DispatcherPriority.Normal);

							}
						});
					}
					catch (Exception e)
					{
						Dispatcher.UIThread.Post(() => {
							cv.elbl.Content = e.Message;
							cv.cbtn.IsEnabled = true;
						}, DispatcherPriority.Normal);
					}
				});
			}
			catch
			{
				cv.elbl.Content = "Failled Connecting";
				cv.cbtn.IsEnabled = true;
			}
		};
		switchviewwithalphatrans(cv);
	}

	void uploadfile(string path, Action<string> res)
	{
		byte[] file = File.ReadAllBytes(path);
        WebClient client = new WebClient();
        client.Credentials = CredentialCache.DefaultCredentials;
        client.Encoding = System.Text.Encoding.UTF8;
        client.Headers.Add("token", authinfo["token"]);
        client.Headers.Add("content-length", file.Length.ToString());
        client.Headers.Add("filename", HttpUtility.UrlEncode(Path.GetFileName(path)));
        client.Headers.Add("content-type", "File/" + Path.GetExtension(path).Replace(".", ""));
        client.UploadDataAsync(new Uri(Path.Combine(serverurl,"upload")), "POST", file);
		
        client.UploadDataCompleted += (s, e) => {
            string reply = JsonConvert.DeserializeObject<Dictionary<string, string>>(System.Text.Encoding.UTF8.GetString(e.Result))["url"];
			
			res(reply);
            client.Dispose();
        };
        
    }

	void loadmainview()
	{
		onlinetmr.Start();
		chatupdatetmr.Start();
		MainView mv = new();
		mv.chatarea.removerep.Click += (e, a) => {
			mv.chatarea.replyid = null;
			mv.chatarea.repdock.IsVisible = false;
		};
		mv.chatarea.up.Click += (e, a) => {
            OpenFileDialog filedialog = new();
            filedialog.ShowAsync(this).ContinueWith((Task<string[]?> task) =>
            {
                Dispatcher.UIThread.InvokeAsync(() =>
                {
                    string[]? files = task.Result;
                    if (files != null && files.Length != 0)
                    {
						uploaditm ui = new();
						try
						{
							ui.img.Source = new Bitmap(files[0]);

                        }
                        catch { }
                        mainv.chatarea.fuploads.Children.Add(ui);
                        void afterupload(string url)
						{
                            mainv.chatarea.ufiles.Add(url);
							ui.ul.IsVisible = false;
							ui.rembtn.Click += (e, a) => {
								mainv.chatarea.ufiles.Remove(url);
                                mainv.chatarea.fuploads.Children.Remove(ui);
                            };
                        }
                        uploadfile(files[0], afterupload);
                    }
                });
            });
        };

        int lastloadeditem = 0;
		mv.chatslistscroll.ScrollChanged += (e, a) =>
		{
			if (mv.chatslistscroll.Offset.Y > ((lastloadeditem - 1) * 60) - mv.chatslistscroll.Height)
			{
				loadchatslistitem();
			}
		};

		mv.chatarea.ti.Click += (e, a) => {
		bool isgroup = !currentchatid.Contains("-");
        StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], uid = currentchatr, groupid = currentchatr }));
        var task = mainclient.PostAsync(Path.Combine(serverurl, isgroup ? "getgroup" : "getuser"), sc);
			task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
			{
				try
				{
					Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
					Task continuation = task.ContinueWith(t =>
					{
						if (t.IsCompletedSuccessfully)
						{
							Dispatcher.UIThread.Post(() =>
							{
								Dictionary<string, string> userprofile = JsonConvert.DeserializeObject<Dictionary<string, string>>(t.Result);
								string pfpurl = userprofile["picture"].Replace("%SERVER%", serverurl);
								normaldialog dg = new();
								dg.ttl.Content = "Info";
								infodialog upe = new();
								try
								{
									var task = ImageLoader.AsyncImageLoader.ProvideImageAsync(userprofile["picture"].Replace("%SERVER%", serverurl));
									var cnting = task.ContinueWith((Task<Bitmap?> bt) =>
									{
										var image = bt.Result;
										if (image != null)
										{
											Dispatcher.UIThread.Post(() => upe.pfp.Source = image);
										}
									});
								}
								catch { }
								
								upe.nametb.Text = userprofile["name"];

								if (isgroup)
								{
									upe.gid.Text = currentchatr;
									upe.biotb.Text = userprofile["info"];
                                    StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], groupid = currentchatr }));
                                    var task = mainclient.PostAsync(Path.Combine(serverurl, "getgrouproles"), sc);
                                    task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
                                    {
                                        try
                                        {
                                            Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
                                            Task continuation = task.ContinueWith(t =>
                                            {
                                                if (t.IsCompletedSuccessfully)
                                                {
                                                    Dispatcher.UIThread.Post(() =>
                                                    {
                                                        Dictionary<String, Dictionary<String, Object>> roles = JsonConvert.DeserializeObject<Dictionary<String, Dictionary<String, Object>>>(t.Result);
                                                        StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], groupid = currentchatr }));
                                                        var task = mainclient.PostAsync(Path.Combine(serverurl, "getgroupusers"), sc);
                                                        task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
                                                        {
                                                            try
                                                            {
                                                                Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
                                                                Task continuation = task.ContinueWith(t =>
                                                                {
                                                                    if (t.IsCompletedSuccessfully)
                                                                    {
                                                                        Dispatcher.UIThread.Post(() =>
                                                                        {
                                                                            Dictionary<String, Dictionary<String, String>> users = JsonConvert.DeserializeObject<Dictionary<String, Dictionary<String, String>>>(t.Result);
																			Dictionary<String, String> cuser = users[authinfo["uid"]];
																			Dictionary<String, Object> crole = roles[cuser["role"]];
																			string pfpurl = userprofile["picture"];
																			if ((bool)crole["AllowEditingSettings"] == true)
																			{
                                                                                upe.nametb.IsReadOnly = false;
                                                                                upe.biotb.IsReadOnly = false;
																				upe.pfp.PointerEntered += (e, a) =>
																				{
																					upe.pfp.Opacity = 0.7;
																				};

																				upe.pfp.PointerExited += (e, a) =>
																				{
																					upe.pfp.Opacity = 1;
																				};
																				upe.pfp.PointerReleased += (e, a) => {
																					OpenFileDialog filedialog = new();
																					filedialog.ShowAsync(this).ContinueWith((Task<string[]?> task) =>
																					{
																						Dispatcher.UIThread.InvokeAsync(() =>
																						{
																							string[]? files = task.Result;
																							if (files != null && files.Length != 0)
																							{
																								
																								try
																								{
																									upe.pfp.Source = new Bitmap(files[0]);

																								}
																								catch { }
																								upe.elbl.Content = "Uploading...";
																								void afterupload(string url)
																								{
																									pfpurl = url;
																									upe.elbl.Content = "Uploaded!";
																								}
																								uploadfile(files[0], afterupload);
																							}
																						});
																					});
																				};
            
																				Button savebtn = new() { Content = "Save" };
																				savebtn.Click += (e, a) =>
																				{
																					mv.maing.Children.Remove(dg);
																					StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], groupid = currentchatr, name = upe.nametb.Text, picture = pfpurl, info = upe.biotb.Text }));
																					var task = mainclient.PostAsync(Path.Combine(serverurl, "editgroup"), sc);
																				};
																				dg.btnarea.Children.Add(savebtn);
                                                                            }else {
																				upe.nametb.IsReadOnly = true;
                                                                                upe.biotb.IsReadOnly = true;
																			}
																			
																			
																			

                                                                            foreach (KeyValuePair<string, Dictionary<string, string>> entry in users)
                                                                            {
																				//try {
																					guserli u = new();
																					if ((bool)crole["AllowEditingUsers"] == true)
																					{
																						ComboBox cb = new();
																						foreach (KeyValuePair<string, Dictionary<string, object>> r in roles)
																						{
																							cb.Items.Add(r.Key);
																						}
																						cb.SelectedItem = entry.Value["role"];
																						//bool isfirst = true;
																						cb.SelectionChanged += (y,e) => {
																							try {
																								//if (isfirst) {
																								//	
																								//	isfirst = false;
																								//	return;
																								//}
																								upe.elbl.Content = "Please Wait...";
																								StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], groupid = currentchatr, userid = entry.Value["user"],role = cb.SelectedItem.ToString()}));
																								var task = mainclient.PostAsync(Path.Combine(serverurl, "edituser"), sc);
																								task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
																								{
																									
																										Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
																										Task continuation = task.ContinueWith(t =>
																										{
																											if (t.IsCompletedSuccessfully)
																											{
																												Dispatcher.UIThread.Post(() =>
																												{
																												
																														Dictionary<string, string> result = JsonConvert.DeserializeObject<Dictionary<string, string>>(t.Result);
																														if (result["status"] == "error")
																														{
																															
																															upe.elbl.Content = result["description"];
																															
																														}
																														else
																														{
																															
																															upe.elbl.Content = "Done!";
																															
																														}
																													
																												}, DispatcherPriority.Normal);
																											}
																											else{
																												Dispatcher.UIThread.Post(() =>
																												{
																													upe.elbl.Content = "Connection fail";
																												}, DispatcherPriority.Normal);
																											}
																										});
																									
																									
																								});
																							}catch (Exception ex) {
																								showerror(ex);
																							}
																						};
																						u.rc.Children.Add(cb);
																					}else {
																						Label rl = new();
																						rl.Content = entry.Value["role"];
																						u.rc.Children.Add(rl);
																					}
																					upe.usersarea.Children.Add(u);
																					StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], uid = entry.Value["user"] }));
																					var task = mainclient.PostAsync(Path.Combine(serverurl, "getuser"), sc);
																					task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
																					{
																						try
																						{
																							Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
																							Task continuation = task.ContinueWith(t =>
																							{
																								if (t.IsCompletedSuccessfully)
																								{
																									Dispatcher.UIThread.Post(() =>
																									{
																										Dictionary<string, string> user = JsonConvert.DeserializeObject<Dictionary<string, string>>(t.Result);
																										u.uname.Content = user["name"];
																										try
																										{
																											var task = ImageLoader.AsyncImageLoader.ProvideImageAsync(user["picture"].Replace("%SERVER%", serverurl));
																											var cnting = task.ContinueWith((Task<Bitmap?> bt) =>
																											{
																												var image = bt.Result;
																												if (image != null)
																												{
																													Dispatcher.UIThread.Post(() => u.pfp.Source = image);
																												}
																											});
																										}
																										catch { }
																									});
																								}
																							});

																						}
																						catch { }
																					});
																				//}catch (Exception e) {
																				//	showerror(e);
																				//}
                                                                            }
                                                                        });
                                                                    };
                                                                });
                                                            }
                                                            catch { }
                                                        });
                                                    });
                                                };
                                            });
                                        }
                                        catch { }
                                    });
                                    
								}
								else
								{
									upe.nametb.IsReadOnly = true;
									upe.biotb.IsReadOnly = true;
									upe.biotb.Text = userprofile["description"];
								}

								dg.contarea.Child = upe;



								Button closebtn = new() { Content = "Close" };
								closebtn.Click += (e, a) =>
								{
									mv.maing.Children.Remove(dg);
								};
								dg.bgcont.PointerPressed += (b, x) =>
								{
									mv.maing.Children.Remove(dg);
								};
								dg.btnarea.Children.Add(closebtn);
                                mainv.maing.Children.Add(dg);
                            });
						}
					});
				}
				catch { }
			});
        };
		void lc(Dictionary<string, object> item)
		{
            JObject inf = (JObject)item["info"];
            if (item["type"].ToString() == "user")
            {
                //ul.uname.Content = item["user"];
                currentchatr = item["user"].ToString();
            }
            else if (item["type"].ToString() == "group")
            {
                //ul.uname.Content = item["group"];
                currentchatr = item["group"].ToString();
            }
            mainv.chatarea.ilbl.Content = "";
            if (selecteditm != null)
            {
                selecteditm.IsChecked = false;
            }
            if (chatslisttb[item["chatid"].ToString()].mtn.IsChecked == false)
            {
                chatslisttb[item["chatid"].ToString()].mtn.IsChecked = true;
            }
            mainv.chatarea.IsVisible = true;
            mainv.chatarea.pfp.Source = null;
            try
            {
                var task = ImageLoader.AsyncImageLoader.ProvideImageAsync(inf["picture"].ToString().Replace("%SERVER%", serverurl));
                var cnting = task.ContinueWith((Task<Bitmap?> bt) =>
                {
                    var image = bt.Result;
                    if (image != null)
                    {
						Dispatcher.UIThread.Post(() => mainv.chatarea.pfp.Source = image);
                    }else
					{
                        
                    }
                });
            }
            catch { }
            mainv.chatarea.chattitle.Content = inf["name"];
            lastrecvmsg = "";
            mainv.chatarea.chatmain.Children.Clear();
            selecteditm = chatslisttb[item["chatid"].ToString()].mtn;

            Debug.WriteLine(item["type"]);
            if (item["type"].ToString() == "group")
            {
                {
					StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], groupid = item["group"] }));
					var task = mainclient.PostAsync(Path.Combine(serverurl, "getgroupuserscount"), sc);
					task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
					{
						try
						{
							Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
							Task continuation = task.ContinueWith(t =>
							{
								if (t.IsCompletedSuccessfully)
								{
									Dispatcher.UIThread.Post(() =>
									{

										mainv.chatarea.ilbl.Content = t.Result + " Members";

									}, DispatcherPriority.Normal);
								}
							});
						}
						catch { }
					});
				}
				{
					StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], groupid = currentchatr }));
					var task = mainclient.PostAsync(Path.Combine(serverurl, "getgrouproles"), sc);
					task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
					{
						try
						{
							Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
							Task continuation = task.ContinueWith(t =>
							{
								if (t.IsCompletedSuccessfully)
								{
									Dispatcher.UIThread.Post(() =>
									{
										Dictionary<String, Dictionary<String, Object>> roles = JsonConvert.DeserializeObject<Dictionary<String, Dictionary<String, Object>>>(t.Result);
										StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], groupid = currentchatr }));
										var task = mainclient.PostAsync(Path.Combine(serverurl, "getgroupusers"), sc);
										task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
										{
											try
											{
												Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
												Task continuation = task.ContinueWith(t =>
												{
													if (t.IsCompletedSuccessfully)
													{
														Dispatcher.UIThread.Post(() =>
														{
															Dictionary<String, Dictionary<String, String>> users = JsonConvert.DeserializeObject<Dictionary<String, Dictionary<String, String>>>(t.Result);
															Dictionary<String, String> cuser = users[authinfo["uid"]];
															curole = roles[cuser["role"]];
														});
													}
												});
											}catch {}
										});
									});
								}
							});
						}catch{}
					});
				}
            }
            else if (item["type"].ToString() == "user")
            {
				curole = aalr;
                StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], uid = item["user"] }));
                var task = mainclient.PostAsync(Path.Combine(serverurl, "getonline"), sc);
                task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
                {
                    try
                    {
                        Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
                        Task continuation = task.ContinueWith(t =>
                        {
                            if (t.IsCompletedSuccessfully)
                            {
                                Dispatcher.UIThread.Post(() =>
                                {
                                    if (t.Result == "Online")
                                    {
                                        chatslisttb[item["chatid"].ToString()].onlinedot.IsVisible = true;
                                        mainv.chatarea.ilbl.Content = "Online";
                                    }
                                    else
                                    {
                                        chatslisttb[item["chatid"].ToString()].onlinedot.IsVisible = false;
                                        try
                                        {
                                            DateTime dt = DateTime.ParseExact(t.Result, "MM dd yyyy, HH:mm zzz", CultureInfo.InvariantCulture);
                                            if (dt.Date == DateTime.Now.Date)
                                            {
                                                mainv.chatarea.ilbl.Content = "Last Seen: " + addleading(dt.Hour) + ":" + addleading(dt.Minute);
                                            }
                                            else
                                            {
                                                mainv.chatarea.ilbl.Content = "Last Seen: " + dt.Year.ToString() + "/" + dt.Month.ToString() + "/" + dt.Day.ToString() + " " + addleading(dt.Hour) + ":" + addleading(dt.Minute);
                                            }
                                        }
                                        catch { }
                                    }
                                }, DispatcherPriority.Normal);
                            }
                        });
                    }
                    catch { }
                });
            }

            {
                StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], chatid = item["chatid"].ToString(), page = 0 }));
                var task = mainclient.PostAsync(Path.Combine(serverurl, "getchatpage"), sc);
                task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
                {
                    try
                    {
                        Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
                        Task continuation = task.ContinueWith(t =>
                        {
                            if (t.IsCompletedSuccessfully)
                            {
                                Dispatcher.UIThread.Post(() =>
                                {
                                    //try
                                    //{
                                    mainv.chatarea.msgkeys.Clear();
                                    sl.Clear();
                                    currentchatid = item["chatid"].ToString();
                                    Dictionary<string, Dictionary<string, object>> result = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, object>>>(t.Result);


                                    foreach (KeyValuePair<string, Dictionary<string, object>> entry in result)
                                    {
                                        addmessage(entry.Key, entry.Value);
                                        mainv.chatarea.chatmainscroll.ScrollToEnd();
                                        lastrecvmsg = entry.Key;
                                    }

                                    //}
                                    //catch { }

                                }, DispatcherPriority.Background);
                            }
                        });
                    }
                    catch { }
                });
            }
        }

		loch = lc;

		void loadchatslistitem()
		{
			if (lastloadeditem != chatslist.Count)
			{
				Dictionary<string, object> item = chatslist[lastloadeditem];
				JObject inf = (JObject)item["info"];

				ulistitem ul = new();
				chatslisttb[item["chatid"].ToString()] = ul;

                if (item.ContainsKey("lastmessage"))
				{
					JObject lastmsg = (JObject)item["lastmessage"];
					ul.mcontent.Content = lastmsg["content"].ToString().Split("\n")[0];
					DateTime dt = DateTime.ParseExact(lastmsg["time"].ToString(), "MM dd yyyy, HH:mm zzz", CultureInfo.InvariantCulture);
					if (dt.Date == DateTime.Now.Date)
					{
						ul.mtime.Content = addleading(dt.Hour) + ":" + addleading(dt.Minute);
					}
					else
					{
						ul.mtime.Content = dt.Year.ToString() + "/" + dt.Month.ToString() + "/" + dt.Day.ToString() + " " + addleading(dt.Hour) + ":" + addleading(dt.Minute);

					}
				}else
				{
					ul.mtime.Content = "";
					ul.mcontent.Content = "No Messages";
				}
				ul.uname.Content = inf["name"];
				Bitmap? pimg = null;
				try
				{
					var task = ImageLoader.AsyncImageLoader.ProvideImageAsync(inf["picture"].ToString().Replace("%SERVER%",serverurl));
					var cnting = task.ContinueWith((Task<Bitmap?> bt) =>
					{
						var image = bt.Result;
						if (image != null)
						{
							pimg = image;
							Dispatcher.UIThread.Post(() => ul.pfp.Source = pimg);
						}
					});
				}
				catch { }

				

				ul.mtn.Click += (e, a) => {
					lc(item);
                };

				mv.chatslist.Children.Add(ul);
				lastloadeditem += 1;
			}
		};

		void sendchatmessage(string msgcontent)
		{
			StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], chatid = currentchatid, content = msgcontent, replymsg = mainv.chatarea.replyid, files = mainv.chatarea.ufiles }));
			var task = mainclient.PostAsync(Path.Combine(serverurl, "sendmessage"), sc);
			task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
			{
				try
				{
					Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
					Task continuation = task.ContinueWith(t => { });
				}
				catch
				{

				}
			});
			mainv.chatarea.ufiles.Clear();

            mv.chatarea.replyid = null;
			mv.chatarea.repdock.IsVisible = false;
			mainv.chatarea.fuploads.Children.Clear();
        };
		bool isctrl = false;
		mv.chatarea.chattb.KeyDown += (a, b) => {
            if (b.Key == Avalonia.Input.Key.LeftCtrl)
			{
				isctrl = true;
			}
			if (b.Key == Avalonia.Input.Key.Enter && isctrl == false)
			{
				sendchatmessage(mv.chatarea.chattb.Text);
				mv.chatarea.chattb.Text = "";
				//b.Handled = false;
			}
            if (b.Key == Avalonia.Input.Key.Enter && isctrl == true)
            {
				try
				{
					int cindex = mv.chatarea.chattb.CaretIndex;

					string text = mv.chatarea.chattb.Text;
					string newtext = text.Substring(0, cindex) + "\n" + text.Substring(cindex);
					mv.chatarea.chattb.Text = newtext;
					mv.chatarea.chattb.CaretIndex = cindex + 1;
				}catch { }
            }
        };

		mv.chatarea.chattb.KeyUp += (a, b) =>
		{
			if (b.Key == Avalonia.Input.Key.LeftCtrl)
			{
				isctrl = false;
			}
		};
        mv.editpbtn.Click += (e, a) => {
			string pfpurl = userprofile["picture"];
			normaldialog dg = new();
			dg.ttl.Content = "Edit Profile";
			userprofileedit upe = new();
			try
			{
				var task = ImageLoader.AsyncImageLoader.ProvideImageAsync(userprofile["picture"].Replace("%SERVER%", serverurl));
				var cnting = task.ContinueWith((Task<Bitmap?> bt) =>
				{
					var image = bt.Result;
					if (image != null)
					{
						Dispatcher.UIThread.Post(() => upe.pfp.Source = image);
					}
				});
			}
			catch { }
			upe.pfp.PointerEntered += (e, a) => {
				upe.pfp.Opacity = 0.7;
			};

			upe.pfp.PointerExited += (e, a) => {
				upe.pfp.Opacity = 1;
			};
			upe.pfp.PointerReleased += (e, a) => {
                OpenFileDialog filedialog = new();
                filedialog.ShowAsync(this).ContinueWith((Task<string[]?> task) =>
                {
                    Dispatcher.UIThread.InvokeAsync(() =>
                    {
                        string[]? files = task.Result;
                        if (files != null && files.Length != 0)
                        {
							
                            try
                            {
                                upe.pfp.Source = new Bitmap(files[0]);

                            }
                            catch { }
                            upe.elbl.Content = "Uploading...";
                            void afterupload(string url)
                            {
								pfpurl = url;
                                upe.elbl.Content = "Uploaded!";
                            }
                            uploadfile(files[0], afterupload);
                        }
                    });
                });
            };
			upe.nametb.Text = userprofile["name"];
			upe.biotb.Text = userprofile["description"];

			dg.contarea.Child = upe;

			upe.logotbtn.Click += (a, e) => {
				loadloginview();
				authinfo.Clear();
			};

			Button closebtn = new() { Content = "Close" };
			closebtn.Click += (e, a) => {
				mv.maing.Children.Remove(dg);
			};
			dg.bgcont.PointerPressed += (b,x) => {
				mv.maing.Children.Remove(dg);
			};
			dg.btnarea.Children.Add(closebtn);

			upe.cpassbtn.Click += (e, a) => {
				normaldialog dga = new();
				dga.ttl.Content = "Change Password";
				changepassdg cgd = new();

				dga.contarea.Child = cgd;

				Button closebtn = new() { Content = "Cancel" };
				closebtn.Click += (e, a) => {
					mv.maing.Children.Remove(dga);
				};
				dga.bgcont.PointerPressed += (b, x) => {
					mv.maing.Children.Remove(dga);
				};
				dga.btnarea.Children.Add(closebtn);

				Button changebtn = new() { Content = "Change" };
				changebtn.Click += (e, a) => {
					cgd.elbl.Content = null;
					changebtn.IsEnabled = false;
					cgd.IsEnabled = false;
					StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], oldpassword = cgd.oldpass.Text, password = cgd.newpass.Text }));
					var task = mainclient.PostAsync(Path.Combine(serverurl, "changepassword"), sc);
					task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
					{
						try
						{
							Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
							Task continuation = task.ContinueWith(t =>
							{
								if (t.IsCompletedSuccessfully)
								{
									Dispatcher.UIThread.Post(() =>
									{
										Dictionary<string, object> result = JsonConvert.DeserializeObject<Dictionary<string, object>>(t.Result);
										if (result.ContainsKey("status") && result["status"].ToString() == "error")
										{
											Dispatcher.UIThread.Post(() =>
											{
												cgd.elbl.Content = result["description"].ToString();
												changebtn.IsEnabled = true;
												cgd.IsEnabled = true;
											}, DispatcherPriority.Normal);
										}
										else
										{
											Dispatcher.UIThread.Post(() =>
											{
												Dictionary<string, string> ai = new();
												ai["token"] = result["token"].ToString();
												ai["uid"] = result["uid"].ToString();
												authinfo = ai;
												mv.maing.Children.Remove(dga);
												mv.maing.Children.Remove(dg);
											}, DispatcherPriority.Normal);
										}
									}, DispatcherPriority.Normal);
								}
								else
								{
									Dispatcher.UIThread.Post(() =>
									{
										cgd.elbl.Content = "Connection fail";
										changebtn.IsEnabled = true;
										cgd.IsEnabled = true;
									}, DispatcherPriority.Normal);
								}
							});
						}
						catch (Exception e)
						{
							Dispatcher.UIThread.Post(() =>
							{
								loadloginview();
							}, DispatcherPriority.Normal);
						}
					});
				};
				dga.btnarea.Children.Add(changebtn);
				mv.maing.Children.Add(dga);
			};

			Button savebtn = new() { Content = "Save" };
			savebtn.Click += (e, a) => {
				upe.elbl.Content = null;
				savebtn.IsEnabled = false;
				upe.IsEnabled = false;
				StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], name = upe.nametb.Text, description = upe.biotb.Text, picture =  pfpurl}));
				var task = mainclient.PostAsync(Path.Combine(serverurl, "updateuser"), sc);
				task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
				{
					try
					{
						Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
						Task continuation = task.ContinueWith(t =>
						{
							if (t.IsCompletedSuccessfully)
							{
								Dispatcher.UIThread.Post(() =>
								{
									Dictionary<string, string> result = JsonConvert.DeserializeObject<Dictionary<string, string>>(t.Result);
									if (result["status"] == "error")
									{
										Dispatcher.UIThread.Post(() =>
										{
											upe.elbl.Content = result["description"];
											savebtn.IsEnabled = true;
											upe.IsEnabled = true;
										}, DispatcherPriority.Normal);
									}
									else
									{
										Dispatcher.UIThread.Post(() =>
										{
											loadprofinfo();
											upe.elbl.Content = "Done!";
											savebtn.IsEnabled = true;
											upe.IsEnabled = true;
										}, DispatcherPriority.Normal);
									}
								}, DispatcherPriority.Normal);
							}
							else{
								Dispatcher.UIThread.Post(() =>
								{
									upe.elbl.Content = "Connection fail";
									savebtn.IsEnabled = true;
									upe.IsEnabled = true;
								}, DispatcherPriority.Normal);
							}
						});
					}
					catch (Exception e)
					{
						Dispatcher.UIThread.Post(() =>
						{
							loadloginview();
						}, DispatcherPriority.Normal);
					}
				});
			};
			dg.btnarea.Children.Add(savebtn);

			mv.maing.Children.Add(dg);
		};

		mv.addfab.Click += (e, a) => {
			normaldialog dg = new();
			dg.ttl.Content = "Add New Chat";
			adddialog adg = new();
			
			dg.contarea.Child = adg;

			Button closebtn = new() { Content = "Cancel" };
			closebtn.Click += (e, a) => {
				mv.maing.Children.Remove(dg);
			};
			dg.bgcont.PointerPressed += (b, x) => {
				mv.maing.Children.Remove(dg);
			};
			dg.btnarea.Children.Add(closebtn);

			Button creategroupbtn = new() { Content = "Create Group" };
			creategroupbtn.Click += (e, a) => {
				string gpic = "";
				normaldialog dga = new();
				dga.ttl.Content = "Create New Group";
				creategroupdg cgd = new();

				dga.contarea.Child = cgd;

				Button closebtn = new() { Content = "Cancel" };
				closebtn.Click += (e, a) => {
					mv.maing.Children.Remove(dga);
				};
				dga.bgcont.PointerPressed += (b, x) => {
					mv.maing.Children.Remove(dga);
				};
				dga.btnarea.Children.Add(closebtn);
                cgd.img.PointerEntered += (e, a) => {
                    cgd.img.Opacity = 0.7;
                };

                cgd.img.PointerExited += (e, a) => {
                    cgd.img.Opacity = 1;
                };
                cgd.img.PointerReleased += (x, y) => {
                    OpenFileDialog filedialog = new();
                    filedialog.ShowAsync(this).ContinueWith((Task<string[]?> task) =>
                    {
                        Dispatcher.UIThread.InvokeAsync(() =>
                        {
                            string[]? files = task.Result;
                            if (files != null && files.Length != 0)
                            {

                                try
                                {
                                    cgd.pfp.Source = new Bitmap(files[0]);

                                }
                                catch { }
                                cgd.elbl.Content = "Uploading...";
                                void afterupload(string url)
                                {
                                    gpic = url;
                                    cgd.elbl.Content = "Uploaded!";
                                }
                                uploadfile(files[0], afterupload);
                            }
                        });
                    });
                }; 

				Button createbtn = new() { Content = "Create" };
				createbtn.Click += (e, a) => {
					cgd.elbl.Content = null;
					createbtn.IsEnabled = false;
					cgd.IsEnabled = false;
					StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], name = cgd.nametb.Text, picture = gpic, info = cgd.infotb.Text }));
					var task = mainclient.PostAsync(Path.Combine(serverurl, "creategroup"), sc);
					task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
					{
						try
						{
							Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
							Task continuation = task.ContinueWith(t =>
							{
								if (t.IsCompletedSuccessfully)
								{
									Dispatcher.UIThread.Post(() =>
									{
										Dictionary<string, string> result = JsonConvert.DeserializeObject<Dictionary<string, string>>(t.Result);
										if (result.ContainsKey("status") && result["status"] == "error")
										{
											Dispatcher.UIThread.Post(() =>
											{
												cgd.elbl.Content = result["description"];
												createbtn.IsEnabled = true;
												cgd.IsEnabled = true;
											}, DispatcherPriority.Normal);
										}
										else
										{
											Dispatcher.UIThread.Post(() =>
											{
												loadchats();
												mv.maing.Children.Remove(dga);
												mv.maing.Children.Remove(dg);
											}, DispatcherPriority.Normal);
										}
									}, DispatcherPriority.Normal);
								}
								else
								{
									Dispatcher.UIThread.Post(() =>
									{
										cgd.elbl.Content = "Connection fail";
										creategroupbtn.IsEnabled = true;
										cgd.IsEnabled = true;
									}, DispatcherPriority.Normal);
								}
							});
						}
						catch (Exception e)
						{
							Dispatcher.UIThread.Post(() =>
							{
								loadloginview();
							}, DispatcherPriority.Normal);
						}
					});
				};
				dga.btnarea.Children.Add(createbtn);
				mv.maing.Children.Add(dga);
			};
			dg.btnarea.Children.Add(creategroupbtn);

			Button addgroupbtn = new() { Content = "Join Group" };
			addgroupbtn.Click += (e, a) => {
				adg.elbl.Content = null;
				addgroupbtn.IsEnabled = false;
				adg.IsEnabled = false;
				StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], groupid = adg.emailoridtb.Text }));
				var task = mainclient.PostAsync(Path.Combine(serverurl, "joingroup"), sc);
				task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
				{
					try
					{
						Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
						Task continuation = task.ContinueWith(t =>
						{
							if (t.IsCompletedSuccessfully)
							{
								Dispatcher.UIThread.Post(() =>
								{
									Dictionary<string, string> result = JsonConvert.DeserializeObject<Dictionary<string, string>>(t.Result);
									if (result["status"] == "error")
									{
										Dispatcher.UIThread.Post(() =>
										{
											adg.elbl.Content = result["description"];
											addgroupbtn.IsEnabled = true;
											adg.IsEnabled = true;
										}, DispatcherPriority.Normal);
									}
									else
									{
										Dispatcher.UIThread.Post(() =>
										{
											loadchats();
											mv.maing.Children.Remove(dg);
										}, DispatcherPriority.Normal);
									}
								}, DispatcherPriority.Normal);
							}
							else
							{
								Dispatcher.UIThread.Post(() =>
								{
									adg.elbl.Content = "Connection fail";
									addgroupbtn.IsEnabled = true;
									adg.IsEnabled = true;
								}, DispatcherPriority.Normal);
							}
						});
					}
					catch (Exception e)
					{
						Dispatcher.UIThread.Post(() =>
						{
							loadloginview();
						}, DispatcherPriority.Normal);
					}
				});
			};
			dg.btnarea.Children.Add(addgroupbtn);

			Button adduserbtn = new() { Content = "Add User" };
			adduserbtn.Click += (e, a) => {
				adg.elbl.Content = null;
				adduserbtn.IsEnabled = false;
				adg.IsEnabled = false;
				StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], email = adg.emailoridtb.Text }));
				var task = mainclient.PostAsync(Path.Combine(serverurl, "adduserchat"), sc);
				task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
				{
					try
					{
						Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
						Task continuation = task.ContinueWith(t =>
						{
							if (t.IsCompletedSuccessfully)
							{
								Dispatcher.UIThread.Post(() =>
								{
									Dictionary<string, string> result = JsonConvert.DeserializeObject<Dictionary<string, string>>(t.Result);
									if (result["status"] == "error")
									{
										Dispatcher.UIThread.Post(() =>
										{
											adg.elbl.Content = result["description"];
											adduserbtn.IsEnabled = true;
											adg.IsEnabled = true;
										}, DispatcherPriority.Normal);
									}
									else
									{
										Dispatcher.UIThread.Post(() =>
										{
											loadchats();
											mv.maing.Children.Remove(dg);
										}, DispatcherPriority.Normal);
									}
								}, DispatcherPriority.Normal);
							}
							else
							{
								Dispatcher.UIThread.Post(() =>
								{
									adg.elbl.Content = "Connection fail";
									adduserbtn.IsEnabled = true;
									adg.IsEnabled = true;
								}, DispatcherPriority.Normal);
							}
						});
					}
					catch (Exception e)
					{
						Dispatcher.UIThread.Post(() =>
						{
							loadloginview();
						}, DispatcherPriority.Normal);
					}
				});
			};
			dg.btnarea.Children.Add(adduserbtn);

			mv.maing.Children.Add(dg);
		};

		void loadprofinfo () {
			StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], uid = authinfo["uid"] }));
			var task = mainclient.PostAsync(Path.Combine(serverurl, "getuser"), sc);
			task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
			{
				try
				{
					Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
					Task continuation = task.ContinueWith(t =>
					{
						if (t.IsCompletedSuccessfully)
						{
							Dispatcher.UIThread.Post(() =>
							{
								Dictionary<string, string> result = JsonConvert.DeserializeObject<Dictionary<string, string>>(t.Result);
								if (result.ContainsKey("status") && result["status"] == "error")
								{
									loadloginview();
								}
								else
								{
									userprofile = result;
									mv.currentusername.Content = result["name"];
									try
									{
										var task = ImageLoader.AsyncImageLoader.ProvideImageAsync(result["picture"].Replace("%SERVER%", serverurl));
										var cnting = task.ContinueWith((Task<Bitmap?> bt) =>
										{
											var image = bt.Result;
											if (image != null)
											{
												Dispatcher.UIThread.Post(() => mv.pfp.Source = image);

											}
										});
									}
									catch { }
								}
							}, DispatcherPriority.Normal);
						}
						else
						{
							Dispatcher.UIThread.Post(() =>
							{
								loadloginview();
							}, DispatcherPriority.Normal);

						}
					});
				}
				catch (Exception e)
				{
					Dispatcher.UIThread.Post(() =>
					{
						loadloginview();
					}, DispatcherPriority.Normal);
				}
			});
		}
		
		loadprofinfo();
		void loadchats() {

			mv.chatslist.Children.Clear();
			Button refbtn = new() {Content = "Refresh"};
			refbtn.Click += (e,a) => {
				loadchats();
			};
			mv.chatslist.Children.Add(refbtn);
			selecteditm = null;
			lastloadeditem = 0;
			StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"] }));
			var task = mainclient.PostAsync(Path.Combine(serverurl, "getchatslist"), sc);
			task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
			{
				try
				{
					Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
					Task continuation = task.ContinueWith(t =>
					{
						if (t.IsCompletedSuccessfully)
						{
							Dispatcher.UIThread.Post(() =>
							{
								try
								{
									chatslist = JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(t.Result);
									for (int i = 0; i < 20; i++)
									{
										loadchatslistitem();
									}
								}catch {
									Dispatcher.UIThread.Post(() =>
									{
										loadloginview();
									});
								}
							}, DispatcherPriority.Normal);
						}
						else
						{
							Dispatcher.UIThread.Post(() =>
							{
								loadloginview();
							}, DispatcherPriority.Normal);

						}
					});
				}
				catch (Exception e)
				{
					Dispatcher.UIThread.Post(() =>
					{
						loadloginview();
					}, DispatcherPriority.Normal);
				}
			});
		}
		loadchats();
		mainv = mv;
		switchviewwithalphatrans(mv);
	}
	void loadloginview()
	{
		chatupdatetmr.Stop();
		onlinetmr.Stop();
		loginview lv = new();
		lv.lbtn.Click += (e, a) => {
			lv.elbl.Content = null;
			lv.lbtn.IsEnabled = false;
			lv.rbtn.IsEnabled = false;
			lv.emailtb.IsEnabled = false;
			lv.passtb.IsEnabled = false;
			try
			{
				StringContent sc = new(JsonConvert.SerializeObject(new { email = lv.emailtb.Text, password = lv.passtb.Text }));
				var task = mainclient.PostAsync(Path.Combine(serverurl, "login"), sc);
				task.ContinueWith((Task<HttpResponseMessage> httpTask) => {
					try
					{
						Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
						Task continuation = task.ContinueWith(t =>
						{
							if (t.IsCompletedSuccessfully)
							{
								Dispatcher.UIThread.Post(() => {
									Dictionary<string, object> result = JsonConvert.DeserializeObject<Dictionary<string, object>>(t.Result);
									if (result.ContainsKey("status") && result["status"].ToString() == "error")
									{
										lv.elbl.Content = result["description"].ToString();
										lv.lbtn.IsEnabled = true;
										lv.rbtn.IsEnabled = true;
										lv.emailtb.IsEnabled = true;
										lv.passtb.IsEnabled = true;
									}
									else
									{
										Dictionary<string, string> ai = new();
										ai["token"] = result["token"].ToString();
										ai["uid"] = result["uid"].ToString();
										authinfo = ai;
										loadmainview();
									}
								}, DispatcherPriority.Normal);
							}
							else
							{
								Dispatcher.UIThread.Post(() => {
									lv.elbl.Content = "Failled Logging In.";
									lv.lbtn.IsEnabled = true;
									lv.rbtn.IsEnabled = true;
									lv.emailtb.IsEnabled = true;
									lv.passtb.IsEnabled = true;
								}, DispatcherPriority.Normal);

							}
						});
					}
					catch (Exception e)
					{
						Dispatcher.UIThread.Post(() => {
							lv.elbl.Content = e.Message;
							lv.lbtn.IsEnabled = true;
							lv.rbtn.IsEnabled = true;
							lv.emailtb.IsEnabled = true;
							lv.passtb.IsEnabled = true;
						}, DispatcherPriority.Normal);
					}
				});
			}
			catch
			{
				lv.elbl.Content = "Failled";
				lv.lbtn.IsEnabled = true;
				lv.rbtn.IsEnabled = true;
				lv.emailtb.IsEnabled = true;
				lv.passtb.IsEnabled = true;
			}
		};
		lv.rbtn.Click += (e, a) => {
			lv.elbl.Content = null;
			lv.lbtn.IsEnabled = false;
			lv.rbtn.IsEnabled = false;
			lv.emailtb.IsEnabled = false;
			lv.passtb.IsEnabled = false;
			try
			{
				StringContent sc = new(JsonConvert.SerializeObject(new { email = lv.emailtb.Text, password = lv.passtb.Text }));
				var task = mainclient.PostAsync(Path.Combine(serverurl, "signup"), sc);
				task.ContinueWith((Task<HttpResponseMessage> httpTask) => {
					try
					{
						Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
						Task continuation = task.ContinueWith(t =>
						{
							if (t.IsCompletedSuccessfully)
							{
								Dispatcher.UIThread.Post(() => {
									Dictionary<string, object> result = JsonConvert.DeserializeObject<Dictionary<string, object>>(t.Result);
									if (result.ContainsKey("status") && result["status"].ToString() == "error")
									{
										lv.elbl.Content = result["description"];
										lv.lbtn.IsEnabled = true;
										lv.rbtn.IsEnabled = true;
										lv.emailtb.IsEnabled = true;
										lv.passtb.IsEnabled = true;
									}
									else
									{
										Dictionary<string, string> ai = new();
										ai["token"] = result["token"].ToString();
										ai["uid"] = result["uid"].ToString();
										authinfo = ai;
										loadmainview();
									}
								}, DispatcherPriority.Normal);
							}
							else
							{
								Dispatcher.UIThread.Post(() => {
									lv.elbl.Content = "Failled Registering.";
									lv.lbtn.IsEnabled = true;
									lv.rbtn.IsEnabled = true;
									lv.emailtb.IsEnabled = true;
									lv.passtb.IsEnabled = true;
								}, DispatcherPriority.Normal);

							}
						});
					}
					catch (Exception e)
					{
						Dispatcher.UIThread.Post(() => {
							lv.elbl.Content = e.Message;
							lv.lbtn.IsEnabled = true;
							lv.rbtn.IsEnabled = true;
							lv.emailtb.IsEnabled = true;
							lv.passtb.IsEnabled = true;
						}, DispatcherPriority.Normal);
					}
				});
			}
			catch
			{
				lv.elbl.Content = "Failled";
				lv.lbtn.IsEnabled = true;
				lv.rbtn.IsEnabled = true;
				lv.emailtb.IsEnabled = true;
				lv.passtb.IsEnabled = true;
			}
		};
		lv.dbtn.Click += (e, a) => loadconnectview();
		switchviewwithalphatrans(lv);

	}
	
	void switchviewwithalphatrans(UserControl b)
	{
		TimeSpan ts = TimeSpan.FromMilliseconds(200);

		Control a = (Control)this.Content;

		b.Opacity = 0;

		a.Transitions = new Transitions{new DoubleTransition() { Duration = ts, Property = OpacityProperty }};
		b.Transitions = new Transitions { new DoubleTransition() { Duration = ts, Property = OpacityProperty } };

		a.Opacity = 0;

		DispatcherTimer dt = new() { Interval = ts };
		dt.Tick += (a,ba) => {
			this.Content = b;
			b.Opacity = 1;
			dt.Stop();
		};
		dt.Start();
	}
	DateTime od = new();

	void initreactions(WrapPanel wp, Dictionary<string, object> rec, string msgid)
	{
		wp.Children.Clear();
        foreach (KeyValuePair<string, object> entry in rec)
		{
            
            Border reccont = new() { Padding = new Thickness(4), CornerRadius = new CornerRadius(4), Margin = new Thickness(2)};
            Label rect = new() { Content = entry.Key + " " };
			
			int rc = 0;
            foreach (KeyValuePair<string, object> ent in (Dictionary<string,object>)entry.Value)
            {
				Dictionary<string, object> enta = (Dictionary<string, object>)ent.Value;

                if (enta["sender"].ToString() == authinfo["uid"])
				{
					reccont.Background = Brushes.White;
					rect.Foreground = Brushes.Black;
				}
				rc += 1;
            }

			reccont.PointerReleased += (e,a) =>
			{
                StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], chatid = currentchatid, msgid = msgid, reaction = entry.Key }));
                var task = mainclient.PostAsync(Path.Combine(serverurl, "sendreaction"), sc);
            };

            rect.Content = entry.Key + " "  + rc;
            reccont.Child = rect;
			wp.Children.Add(reccont);
        }

    }

	List<string> sl = new();

	chatmsg? addmessage(string key, Dictionary<string,Object> msg)
	{
		if ((!mainv.chatarea.msgkeys.Contains(key)) || key == "0")
		{
            chatmsg cmsg = new();
            if (key != "0")
			{
				mainv.chatarea.msgkeys.Add(key);
				mainv.chatarea.keymsg[key] = msg;
                DateTime dt = DateTime.ParseExact(msg["time"].ToString(), "MM dd yyyy, HH:mm zzz", CultureInfo.InvariantCulture);
                
                if (dt.Date != od.Date)
                {
                    addmessage("0", new Dictionary<string, Object>
                    {
                        { "content", dt.Year.ToString() + "/" + dt.Month.ToString() + "/" + dt.Day.ToString()},
                        { "sender", "0"}
                    });
                }
                cmsg.mtime.Content = addleading(dt.Hour) + ":" + addleading(dt.Minute);
                od = dt;
            }
            
            //try
            {

                if (msg.ContainsKey("files"))
				{
					
					
					foreach (JObject file in (Newtonsoft.Json.Linq.JArray)msg["gImages"])
					{
						cmsg.imgcont.IsVisible = true;
						Border fc = new() { ClipToBounds = true, Width = 100, Height = 100, CornerRadius = new CornerRadius(8), Margin = new Thickness(2), Background = Brushes.Gray};
						Image img = new() { Width = 100, Height = 100 };
						fc.Child = img;
						Bitmap? imga = null;
                        try
                        {
                            var task = ImageLoader.AsyncImageLoader.ProvideImageAsync(file["url"].ToString().Replace("%SERVER%", serverurl));
                            var cnting = task.ContinueWith((Task<Bitmap?> bt) =>
                            {
                                var image = bt.Result;
                                if (image != null)
                                {
                                    Dispatcher.UIThread.Post(() => { img.Source = image;imga = image; });
                                }
                            });
                        }
                        catch { }
						fc.PointerReleased += (e, a) => {
							if (imga != null)
							{
                                MediaViewer mv = new();

                                mv.Show();
                                mv.image.Source = imga;
								mv.tick();
								
								mv.Activate();
                            }else
							{
                                OpenBrowser(file["url"].ToString().Replace("%SERVER%", serverurl));
							}
							
						};
                        cmsg.imgcont.Children.Add(fc);
					}
					foreach (JObject file in (Newtonsoft.Json.Linq.JArray)msg["gFiles"])
					{
						cmsg.filecont.IsVisible = true;
						fileitm fc = new();
						fc.HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch;
						fc.fn.Text = file["name"].ToString();
						try {
							fc.sz.Content = getfilesize((double)file["size"]);
						}catch {
							fc.sz.Content = "Unknown Size.";
						}
						
						((Button)fc.Content).Click += (e, a) => {
							OpenBrowser(file["url"].ToString().Replace("%SERVER%", serverurl));
						};
                        cmsg.filecont.Children.Add(fc);
					}
				}
                if (msg.ContainsKey("reactions"))
				{

                    initreactions(cmsg.mreactions, (Dictionary<string, object>)JObjectConverter.ConvertJObjectToDictionary((JObject)msg["reactions"]),key);
				}
                if (msg.ContainsKey("replymsgid"))
				{
					cmsg.repcont.IsVisible = true;
					try
					{
						cmsg.contrep.Text = msg["replymsgcontent"].ToString();
						cmsg.namerep.Content = msg["replymsgsender"].ToString();
						cmsg.repcont.PointerReleased += (a, e) => {
							if (mainv.chatarea.msgkeys.Contains(msg["replymsgid"]))
							{
								mainv.chatarea.keymsgcont[msg["replymsgid"].ToString()].BringIntoView();
							}
							else
							{

								StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], msgid = msg["replymsgid"] }));
								var task = mainclient.PostAsync(Path.Combine(serverurl, "getmsgpage"), sc);
								task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
								{
									try
									{
										Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
										Task continuation = task.ContinueWith(t =>
										{
											if (t.IsCompletedSuccessfully)
											{
												Dispatcher.UIThread.Post(() =>
												{
													StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], chatid = currentchatid, page = Convert.ToInt32(t.Result) }));
													var task = mainclient.PostAsync(Path.Combine(serverurl, "getchatpage"), sc);
													task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
													{
														try
														{
															Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
															Task continuation = task.ContinueWith(t =>
															{
																if (t.IsCompletedSuccessfully)
																{
																	Dispatcher.UIThread.Post(() =>
																	{
																		//try
																		//{
																		mainv.chatarea.msgkeys.Clear();

                                                                        Dictionary<string, Dictionary<string, object>> result = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, object>>>(t.Result);
																		var kys = result.Keys;

																		for (int i = 0; i < kys.Count; i++)
																		{
																			chatmsg msg = addmessage(kys.ElementAt(i), result[kys.ElementAt(i)]);
																			mainv.chatarea.chatmain.Children.Remove(msg);
																			mainv.chatarea.chatmain.Children.Insert(i, msg);
																			msg.BringIntoView();
																		}
																		//}
																		//catch { }

																	}, DispatcherPriority.Background);
																}
															});
														}
														catch { }
													});
												}, DispatcherPriority.Normal);
											}
										});
									}
									catch { }
								});
							}
						};
					}
					catch
					{
						cmsg.repcont.IsVisible = false;
					}
				}
				else
				{
					cmsg.repcont.IsVisible = false;
				}
				mainv.chatarea.keymsgcont[key] = cmsg;
				SelectableTextBlock contlbl = new() { Text = msg["content"].ToString(), TextWrapping = TextWrapping.WrapWithOverflow };
				if (msg["sender"].ToString() != "0")
				{
					cmsg.uname.Content = ((JObject)msg["senderuser"])["name"].ToString();
					try
					{
						var task = ImageLoader.AsyncImageLoader.ProvideImageAsync(((JObject)msg["senderuser"])["picture"].ToString().Replace("%SERVER%", serverurl));
						var cnting = task.ContinueWith((Task<Bitmap?> bt) =>
						{
							var image = bt.Result;
							if (image != null)
							{
								Dispatcher.UIThread.Post(() => cmsg.pfp.Source = image);
							}
						});
					}
					catch { }
				}else
				{
                    cmsg.pfpborder.IsVisible = false;
                    cmsg.uname.IsVisible = false;
                    cmsg.mtime.IsVisible = false;

                }
                
				cmsg.msgcontent.Children.Add(contlbl);
				mainv.chatarea.chatmain.Children.Add(cmsg);
				Dock dval = Dock.Left;
				if (msg["sender"].ToString() == authinfo["uid"])
				{
					dval = Dock.Right;
					cmsg.msgbuble.Background = new SolidColorBrush(this.PlatformSettings.GetColorValues().AccentColor1);
				}
				else
				{ 
					if (msg["sender"].ToString() == "0")
					{
						dval = Dock.Top;
						cmsg.msgbuble.HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Center;

                    }
					cmsg.bcont.Children.Add(new ListBox());
				}
				if (key != "0")
				{
                    cmsg.Background = Brushes.Transparent;
					cmsg.PointerPressed += (sender, args) => {
						
                        var point = args.GetCurrentPoint(null);
                        var x = point.Position.X + Position.X;
                        var y = point.Position.Y + Position.Y;
						Avalonia.Platform.Screen cscreen = Screens.ScreenFromPoint(PixelPoint.FromPoint(point.Position,1));
						PixelRect bounds = cscreen.WorkingArea;
						
                        if (point.Properties.IsRightButtonPressed)
                        {
                            StackPanel mn = new() { Orientation = Avalonia.Layout.Orientation.Vertical };

							Border reactsbord = new() { CornerRadius = new CornerRadius(15), Height = 30, HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Left, Margin = new Thickness(4), BorderBrush = Brushes.DarkGray, BorderThickness = new Thickness(1), ClipToBounds = true };
							Border ctbord = new() { CornerRadius = new CornerRadius(8), HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Left, Margin = new Thickness(4), BorderBrush = Brushes.DarkGray, BorderThickness = new Thickness(1), ClipToBounds = true };
                            StackPanel ca = new() { Orientation = Avalonia.Layout.Orientation.Vertical };
							isappwin = true;
                            Window vin = new();

                            TimeSpan ts = TimeSpan.FromMilliseconds(500);



                            ctbord.Opacity = 0;
                            reactsbord.Opacity = 0;


                            vin.Loaded += (e, a) => {
                                if (bounds.Bottom < y + vin.Height)
                                {
                                    y -= vin.Height;
                                }
                                if (bounds.Right < x + vin.Width)
                                {
                                    x -= vin.Width;
									ctbord.HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right;
                                }
                                vin.Position = new PixelPoint((int)x, (int)y);

                                DispatcherTimer dt = new() { Interval = TimeSpan.FromMilliseconds(200) };
                                dt.Tick += (a, ba) => {
                                    vin.SizeToContent = SizeToContent.Manual;
                                    
                                    reactsbord.MaxWidth = 30;
                                    ctbord.MaxHeight = 16;
                                    

                                    reactsbord.Transitions = new Transitions { new DoubleTransition() { Duration = ts, Property = Border.MaxWidthProperty, Easing =  new CubicEaseInOut() } }; //, new DoubleTransition() { Duration = ts, Property = Border.OpacityProperty }
                                    ctbord.Transitions = new Transitions { new DoubleTransition() { Duration = ts, Property = Border.MaxHeightProperty, Easing = new CubicEaseInOut() } };

                                    ctbord.Opacity = 1;
                                    reactsbord.Opacity = 1;
                                    reactsbord.MaxWidth = 1000;
                                    ctbord.MaxHeight = 1000;
                                    dt.Stop();
                                };
                                dt.Start();
                                

                            };
							vin.Background = Brushes.Transparent;
							vin.SystemDecorations = SystemDecorations.None;
							vin.Deactivated += (e, a) =>
							{
								vin.Close();
								Activate();
								Focus();
                                isappwin = false;
                            };
							vin.Closed += (e, a) => {
								Focus();
								Activate();
							};
							vin.ExtendClientAreaToDecorationsHint = true;
							vin.CanResize = false;

                            vin.SizeToContent = SizeToContent.WidthAndHeight;
							vin.ExtendClientAreaChromeHints = Avalonia.Platform.ExtendClientAreaChromeHints.NoChrome;
							vin.ExtendClientAreaTitleBarHeightHint = -1;
							vin.ShowInTaskbar = false;
                            
							vin.Content = mn;
							vin.Show();
                            vin.Position = new PixelPoint((int)x, (int)y);
                            StackPanel recitm = new() { Orientation = Avalonia.Layout.Orientation.Horizontal };
							Panel rp = new();
							rp.Children.Add(new ListBox());
							rp.Children.Add(recitm);
							
							Panel cp = new();
							cp.Children.Add(new ListBox());
							cp.Children.Add(ca);
							reactsbord.Child = rp;
							ctbord.Child = cp;
							if ((bool)curole["AllowSendingReactions"] == true) {
								foreach (string i in reactions)
								{
									Button rct = new() { Content = i, Width = 30, Height = 30, Padding = new Thickness(0), HorizontalContentAlignment = Avalonia.Layout.HorizontalAlignment.Center, VerticalContentAlignment = Avalonia.Layout.VerticalAlignment.Center, Background = Brushes.Transparent };
								   
									recitm.Children.Add(rct);
									rct.Click += (e, a) => {
										StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], chatid = currentchatid, msgid = key, reaction = i }));
										var task = mainclient.PostAsync(Path.Combine(serverurl, "sendreaction"), sc);
										vin.Close();
									};
								}
								
								mn.Children.Add(reactsbord);
							}
                            mn.Children.Add(ctbord);


                            Button repitm = new() { Content = "Reply", Background = Brushes.Transparent, HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch };
                            repitm.Click += (e, a) =>
                            {
                                mainv.chatarea.replyid = key;
                                mainv.chatarea.senderrep.Content = ((JObject)msg["senderuser"])["name"].ToString();
                                mainv.chatarea.contentrep.Content = msg["content"].ToString();
                                mainv.chatarea.repdock.IsVisible = true;
                                vin.Close();
                            };
                            ca.Children.Add(repitm);

                            Button saveitm = new() { Content = "Save Message", Background = Brushes.Transparent, HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch };
                            saveitm.Click += (e, a) =>
                            {
                                bool wassingle = false;
                                if (sl.Count == 0)
                                {
                                    sl.Add(key);
                                    wassingle = true;
                                }
                                foreach (string id in sl)
                                {
                                    StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], chatid = currentchatid, msgid = id }));
                                    var task = mainclient.PostAsync(Path.Combine(serverurl, "savemessage"), sc);
                                }
                                if (wassingle)
                                {
                                    sl.Clear();
                                }
                                vin.Close();
                            };
                            ca.Children.Add(saveitm);

                            Button forw = new() { Content = "Forward Message", Background = Brushes.Transparent, HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch };
                            forw.Click += (e, a) =>
                            {
                                vin.Close();
                                bool wassingle = false;
                                if (sl.Count == 0)
                                {
                                    sl.Add(key);
                                    wassingle = true;
                                }
                                StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"] }));
                                var task = mainclient.PostAsync(Path.Combine(serverurl, "getchatslist"), sc);
                                task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
                                {
                                    try
                                    {
                                        Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
                                        Task continuation = task.ContinueWith(t =>
                                        {
                                            if (t.IsCompletedSuccessfully)
                                            {
                                                Dispatcher.UIThread.Post(() =>
                                                {
                                                    //try
                                                    {
                                                        List<string> chatids = new();
                                                        chatslist = JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(t.Result);
                                                        normaldialog dg = new();
                                                        dg.ttl.Content = "Forward To...";
                                                        ScrollViewer sv = new();
                                                        StackPanel sp = new() { Orientation = Avalonia.Layout.Orientation.Vertical };
                                                        dg.contarea.Child = sv;
                                                        sv.Content = sp;
                                                        Button closebtn = new() { Content = "Cancel" };
                                                        closebtn.Click += (e, a) => {
                                                            mainv.maing.Children.Remove(dg);
                                                        };
                                                        dg.bgcont.PointerPressed += (b, x) => {
                                                            mainv.maing.Children.Remove(dg);
                                                        };
                                                        dg.btnarea.Children.Add(closebtn);
                                                        mainv.maing.Children.Add(dg);

                                                        Button sendbtn = new() { Content = "Send" };
                                                        sendbtn.Click += (e, a) => {
                                                            foreach (string cid in chatids)
                                                            {
                                                                foreach (string mid in sl)
                                                                {
                                                                    StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], chatid = currentchatid, msgid = mid, tochatid = cid }));
                                                                    var task = mainclient.PostAsync(Path.Combine(serverurl, "forwardmessage"), sc);
                                                                }
                                                            }
                                                            if (wassingle)
                                                            {
                                                                sl.Clear();
                                                            }
                                                            mainv.maing.Children.Remove(dg);
                                                        };
                                                        dg.btnarea.Children.Add(sendbtn);


                                                        foreach (Dictionary<string, object> item in chatslist)
                                                        {
                                                            JObject inf = (JObject)item["info"];

                                                            ulistitem ul = new();
                                                            ul.mtn.Click += (aa, er) =>
                                                            {
                                                                if (chatids.Contains(item["chatid"]))
                                                                {
                                                                    chatids.Remove((string)item["chatid"]);
                                                                }
                                                                else
                                                                {
                                                                    chatids.Add((string)item["chatid"]);
                                                                }
                                                                ul.mtn.IsChecked = chatids.Contains(item["chatid"]);

                                                            };
                                                            sp.Children.Add(ul);
                                                            if (item.ContainsKey("lastmessage"))
                                                            {
                                                                JObject lastmsg = (JObject)item["lastmessage"];
                                                                ul.mcontent.Content = lastmsg["content"].ToString().Split("\n")[0];
                                                                DateTime dt = DateTime.ParseExact(lastmsg["time"].ToString(), "MM dd yyyy, HH:mm zzz", CultureInfo.InvariantCulture);
                                                                if (dt.Date == DateTime.Now.Date)
                                                                {
                                                                    ul.mtime.Content = addleading(dt.Hour) + ":" + addleading(dt.Minute);
                                                                }
                                                                else
                                                                {
                                                                    ul.mtime.Content = dt.Year.ToString() + "/" + dt.Month.ToString() + "/" + dt.Day.ToString() + " " + addleading(dt.Hour) + ":" + addleading(dt.Minute);

                                                                }
                                                            }
                                                            else
                                                            {
                                                                ul.mtime.Content = "";
                                                                ul.mcontent.Content = "No Messages";
                                                            }
                                                            ul.uname.Content = inf["name"];
                                                            Bitmap? pimg = null;
                                                            try
                                                            {
                                                                var task = ImageLoader.AsyncImageLoader.ProvideImageAsync(inf["picture"].ToString().Replace("%SERVER%", serverurl));
                                                                var cnting = task.ContinueWith((Task<Bitmap?> bt) =>
                                                                {
                                                                    var image = bt.Result;
                                                                    if (image != null)
                                                                    {
                                                                        pimg = image;
                                                                        Dispatcher.UIThread.Post(() => ul.pfp.Source = pimg);
                                                                    }
                                                                });
                                                            }
                                                            catch { }
                                                        }

                                                    }
                                                }, DispatcherPriority.Normal);
                                            }
                                            else
                                            {

                                            }
                                        });
                                    }
                                    catch (Exception e)
                                    {

                                    }
                                });
                            };
                            ca.Children.Add(forw);

                            Button copyitm = new() { Content = "Copy Message", Background = Brushes.Transparent, HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch };
                            copyitm.Click += (e, a) =>
                            {
                                vin.Close();
                                clipboard.SetTextAsync(msg["content"].ToString());
                            };
                            ca.Children.Add(copyitm);

                            Button msi = new() { Content = "Multi-Select", Background = Brushes.Transparent, HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch };
                            msi.Click += (e, a) =>
                            {
                                vin.Close();
                                if (sl.Contains(key))
                                {
                                    cmsg.Background = Brushes.Transparent;
                                    sl.Remove(key);
                                }
                                else
                                {
                                    sl.Add(key);
                                    cmsg.Background = new SolidColorBrush(this.PlatformSettings.GetColorValues().AccentColor1);
                                }
                            };
                            ca.Children.Add(msi);

                            Button delitm = new() { Content = "Delete", Background = Brushes.Transparent, HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch };
                            delitm.Click += (e, a) =>
                            {
                                vin.Close();
                                if (sl.Count == 0)
                                {
                                    sl.Add(key);
                                }
                                foreach (string id in sl)
                                {
                                    StringContent sc = new(JsonConvert.SerializeObject(new { token = authinfo["token"], chatid = currentchatid, msgid = id }));
                                    var task = mainclient.PostAsync(Path.Combine(serverurl, "deletemessage"), sc);
                                    task.ContinueWith((Task<HttpResponseMessage> httpTask) =>
                                    {
                                        try
                                        {

                                            Task<string> task = httpTask.Result.Content.ReadAsStringAsync();
                                            Task continuation = task.ContinueWith(t => { });

                                        }
                                        catch
                                        {

                                        }
                                    });
                                }
                                sl.Clear();

                            };
                            ca.Children.Add(delitm);
                        }else
						{
                            if (sl.Count > 0)
                                if (sl.Contains(key))
                                {
                                    cmsg.Background = Brushes.Transparent;
                                    sl.Remove(key);
                                }
                                else
                                {
                                    sl.Add(key);
                                    cmsg.Background = new SolidColorBrush(this.PlatformSettings.GetColorValues().AccentColor1);
                                }
                        }
                    };
                    
				}
				DockPanel.SetDock(cmsg.pfpborder, dval);
				DockPanel.SetDock(cmsg.mainsp, dval);
				return cmsg;
			}//catch { }
		}else
		{
			return null;
		}
	}

	string addleading(int number)
	{
		int decimalLength = 2;
		return number.ToString("D" + decimalLength.ToString());
	}

    public static void OpenBrowser(string url)
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            url = url.Replace("&", "^&");
            Process.Start(new ProcessStartInfo("cmd", $"/c start {url}") { CreateNoWindow = true });
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        {
            Process.Start("xdg-open", url);
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            Process.Start("open", url);
        }
        else
        {
			//...
		}
    }
	
	public void showerror(Exception e) {
		Window w = new();
		w.Title = "An error occurred!";
		ScrollViewer s = new() {HorizontalScrollBarVisibility = ScrollBarVisibility.Auto};
		SelectableTextBlock tb = new() {Text = e.ToString()};
		s.Content = tb;
		w.Content = s;
		w.Show();
	}
	string getfilesize(double len) {
		string[] sizes = { "B", "KB", "MB", "GB", "TB" };
		int order = 0;
		while (len >= 1024 && order < sizes.Length - 1) {
			order++;
			len = len/1024;
		}

		// Adjust the format string to your preferences. For example "{0:0.#}{1}" would
		// show a single decimal place, and no space.
		return String.Format("{0:0.##} {1}", len, sizes[order]);
	}
}
