#!/usr/bin/env bash

dir="$HOME/.config/polybar"

launch_bar() {
  # Terminate already running bar instances
  killall -q polybar

  # Wait until the processes have been shut down
  while pgrep -u $UID -x polybar >/dev/null; do sleep 1; done

  # Launch the bar
  polybar -q main -c "$dir/$style/config.ini" &
}

if [[ "$1" == "--colorful" ]]; then
  style="colorful"
  launch_bar
elif [[ "$1" == "--unite" ]]; then
  style="unite"
  launch_bar
else
  cat <<-EOF
	Usage : launch.sh --theme

	Available Themes :
	--unite    --colorful
	EOF
fi
