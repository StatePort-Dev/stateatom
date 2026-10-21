# Native X11 drag source for one real directory URI; evaluation harness only.
import sys, pathlib, gi
gi.require_version('Gtk','3.0')
from gi.repository import Gtk,Gdk
uri=pathlib.Path(sys.argv[1]).resolve().as_uri()
w=Gtk.Window(title='StateAtom exact folder drag source')
w.set_default_size(280,140)
w.move(770,300)
b=Gtk.Button(label='Drag exact Atom test folder')
b.drag_source_set(Gdk.ModifierType.BUTTON1_MASK,[Gtk.TargetEntry.new('text/uri-list',0,0)],Gdk.DragAction.COPY)
b.connect('drag-data-get',lambda _w,_ctx,data,_info,_time:data.set_uris([uri]))
w.add(b)
w.connect('destroy',Gtk.main_quit)
w.show_all()
Gtk.main()
