import PopupWindow, { Padding } from 'widget/PopupWindow';
import ClipItem from './ClipItem';
import type Gtk from 'gi://Gtk?version=3.0';
import icons from 'lib/icons';
import options from 'options';
import cliphist from 'service/cliphist';

const { query } = cliphist;

const { width, margin } = options.clipboard;

const WINDOW_NAME = 'clipboard';

const SeparatedClipItem = (clip: string) =>
  Widget.Revealer({ attribute: { name: clip }, revealChild: true }, Widget.Box<Gtk.Widget>({ vertical: true }, Widget.Separator(), ClipItem(clip)));

const Clipboard = () => {
  const cliplist = Variable(query(''));
  const list = Widget.Box({
    vertical: true,
    children: cliplist.bind().as(list => list.map(SeparatedClipItem)),
  });

  list.hook(cliphist, () => (cliplist.value = query('')), 'cliphist-changed');

  const entry = Widget.Entry({
    hexpand: true,
    primaryIconName: icons.ui.search,
    onAccept: clipItem => {
      App.toggleWindow(WINDOW_NAME);
      cliphist.select(clipItem);
    },
    onChange: ({ text }) => {
      list.children.reduce((i, item) => {
        if (!text) {
          item.reveal_child = true;
          return i;
        }
        if (item.attribute.name.includes(text)) {
          item.reveal_child = true;
          return ++i;
        }
        item.reveal_child = false;
        return i;
      }, 0);
    },
  });

  function focus() {
    entry.text = '';
    entry.set_position(-1);
    entry.select_region(0, -1);
    entry.grab_focus();
  }

  const layout = Widget.Box({
    css: width.bind().as(v => `min-width: ${v}pt;`),
    className: WINDOW_NAME,
    vertical: true,
    vpack: 'start',
    children: [
      entry,
      Widget.Scrollable({
        hscroll: 'never',
        child: list,
      }),
    ],
    setup: self => {
      self.hook(App, (_, win, visible) => {
        if (win !== WINDOW_NAME) return;
        entry.text = '';
        if (visible) focus();
      });
    },
  });

  return Widget.Box<Gtk.Widget>(
    { vertical: true, css: 'padding: 1px' },
    Padding(WINDOW_NAME, {
      css: margin.bind().as(v => `min-height: ${v}pt;`),
      vexpand: false,
    }),
    layout,
  );
};

export default () =>
  PopupWindow({
    name: WINDOW_NAME,
    layout: 'top',
    child: Clipboard(),
  });
