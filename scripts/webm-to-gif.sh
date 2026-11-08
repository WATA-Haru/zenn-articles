#!/usr/bin/env bash
# Convert a WebM video into an animated GIF while keeping it below a size limit.
set -euo pipefail

width=640

#3MB limited
max_bytes=3000000

usage() {
  cat <<'EOF'
Usage: webm-to-gif.sh [options] INPUT.webm OUTPUT.gif

Options:
  -w, --width PX        Output width in pixels (default: 500)
  -m, --max-bytes BYTES Maximum output size in bytes (default: 3000000)
  -h, --help            Show this help

Requires: ffmpeg and ffprobe

The script first tries the input frame rate at 256 colors, then reduces the
frame rate and color count only as needed to meet the size limit. The output
file is replaced only after a successful conversion.
EOF
}

while (($#)); do
  case "$1" in
    -w|--width)
      width=${2:?"$1 requires a pixel value"}
      shift 2
      ;;
    -m|--max-bytes)
      max_bytes=${2:?"$1 requires a byte value"}
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    -*)
      printf 'Unknown option: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
    *)
      break
      ;;
  esac
done

if (($# != 2)); then
  usage >&2
  exit 2
fi

input=$1
output=$2

if [[ ! -f $input ]]; then
  printf 'Input file does not exist: %s\n' "$input" >&2
  exit 1
fi

if ! [[ $width =~ ^[1-9][0-9]*$ ]]; then
  printf 'Width must be a positive integer: %s\n' "$width" >&2
  exit 2
fi

if ! [[ $max_bytes =~ ^[1-9][0-9]*$ ]]; then
  printf 'Maximum size must be a positive integer in bytes: %s\n' "$max_bytes" >&2
  exit 2
fi

for command in ffmpeg ffprobe; do
  if ! command -v "$command" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$command" >&2
    exit 1
  fi
done

source_fps=$(ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate \
  -of default=nokey=1:noprint_wrappers=1 "$input")
if ! [[ $source_fps =~ ^[1-9][0-9]*(/[1-9][0-9]*)?$ ]]; then
  source_fps=30
fi

output_dir=$(dirname "$output")
mkdir -p "$output_dir"
temporary_output=$(mktemp "$output_dir/.webm-to-gif.XXXXXX.gif")
trap 'rm -f -- "$temporary_output"' EXIT

# FPS:palette-colors, ordered from highest quality to most compact.
variants=(
  "$source_fps:256"
  "30:256"
  "20:256"
  "15:256"
  "12:192"
  "10:128"
  "8:96"
)

for variant in "${variants[@]}"; do
  fps=${variant%%:*}
  colors=${variant##*:}

  printf 'Trying %sfps, %s colors...\n' "$fps" "$colors"
  ffmpeg -y -hide_banner -loglevel error -i "$input" \
    -filter_complex "[0:v]fps=${fps},scale=${width}:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=${colors}:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle" \
    -loop 0 "$temporary_output"

  output_bytes=$(wc -c < "$temporary_output" | tr -d ' ')
  if ((output_bytes <= max_bytes)); then
    mv -f -- "$temporary_output" "$output"
    trap - EXIT
    printf 'Created %s (%s bytes; %sfps, %s colors)\n' \
      "$output" "$output_bytes" "$fps" "$colors"
    exit 0
  fi
done

printf 'Could not reach %s bytes at %spx wide. Try a narrower width or a larger limit.\n' \
  "$max_bytes" "$width" >&2
exit 1
