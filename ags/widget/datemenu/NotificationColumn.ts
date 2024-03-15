import { type Notification as Notif } from 'types/service/notifications';
import Notification from 'widget/notifications';
import options from 'options';
import icons from 'lib/icons';

const notifications = await Service.import('notifications');
const notifs = notifications.bind('notifications');

const Animated = (n: Notif) =>
  Widget.Revealer({
    transitionDuration: options.transition.value,
    transition: 'slide_down',
    child: Notification(n),
    setup: self =>
      Utils.timeout(options.transition.value, () => {
        if (!self.is_destroyed) self.reveal_child = true;
      }),
  });

const ClearButton = () =>
  Widget.Button({
    onClicked: notifications.clear,
    sensitive: notifs.as(n => n.length > 0),
    child: Widget.Box({
      children: [
        Widget.Label('Clear '),
        Widget.Icon({
          icon: notifs.as(n => icons.trash[n.length > 0 ? 'full' : 'empty']),
        }),
      ],
    }),
  });

const Header = () =>
  Widget.Box({
    className: 'header',
    children: [Widget.Label({ label: 'Notifications', hexpand: true, xalign: 0 }), ClearButton()],
  });

const NotificationList = () => {
  const map: Map<number, ReturnType<typeof Animated>> = new Map();
  const box = Widget.Box({
    vertical: true,
    children: notifications.notifications.map(n => {
      const w = Animated(n);
      map.set(n.id, w);
      return w;
    }),
    visible: notifs.as(n => n.length > 0),
  });

  function remove(_: unknown, id: number) {
    const n = map.get(id);
    if (n) {
      n.revealChild = false;
      Utils.timeout(options.transition.value, () => {
        n.destroy();
        map.delete(id);
      });
    }
  }

  return box.hook(notifications, remove, 'closed').hook(
    notifications,
    (_, id: number) => {
      if (id !== undefined) {
        if (map.has(id)) remove(null, id);
        const n = notifications.getNotification(id)!;
        const w = Animated(n);
        map.set(id, w);
        box.children = [w, ...box.children];
      }
    },
    'notified',
  );
};

const Placeholder = () =>
  Widget.Box({
    className: 'placeholder',
    vertical: true,
    vpack: 'center',
    hpack: 'center',
    vexpand: true,
    hexpand: true,
    visible: notifs.as(n => n.length === 0),
    children: [Widget.Icon({ icon: icons.notifications.silent, size: options.notifications.iconSize.bind() }), Widget.Label(options.notifications.text.value)],
  });

export default () =>
  Widget.Box({
    className: 'notifications',
    css: options.notifications.width.bind().as(w => `min-width: ${w}px`),
    vertical: true,
    children: [
      Header(),
      Widget.Scrollable({
        vexpand: true,
        hscroll: 'never',
        className: 'notification-scrollable',
        child: Widget.Box({
          className: 'notification-list vertical',
          vertical: true,
          children: [NotificationList(), Placeholder()],
        }),
      }),
    ],
  });
