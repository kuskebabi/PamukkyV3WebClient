using System.Collections;
using System.Collections.Generic;
using Avalonia.Controls;

namespace PamukkyDesktopClient.Views
{
    public partial class chatarea : UserControl
    {
        public ArrayList msgkeys = new();
        public Dictionary<string, chatmsg> keymsgcont = new();
        public Dictionary<string, Dictionary<string, object>> keymsg = new();
        public string? replyid = null;
        public List<string> ufiles = new();
        public chatarea()
        {
            InitializeComponent();
        }
    }
}
