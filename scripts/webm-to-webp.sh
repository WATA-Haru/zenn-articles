#!/usr/bin/env bash
# Convert a WebM video into a high-quality animated WebP under a size limit.
set -euo pipefail

max_bytes=2900000

usage() {
  cat <<'EOF'
Usage: webm-to-webp.sh [options] INPUT.webm OUTPUT.webp

Options:
  -m, --max-bytes BYTES  Maximum output size (default: 2900000)
  -h, --help             Show this help

Requires: ffmpeg with the libwebp_anim encoder

The script preserves the input frame timing and first tries the original
resolution at quality 90. It reduces quality or resolution only as needed to
meet the size limit. Output loops indefinitely.
EOF
}

while (($#)); do
  case "$1" in
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

if ! [[ $max_bytes =~ ^[1-9][0-9]*$ ]]; then
  printf 'Maximum size must be a positive integer in bytes: %s\n' "$max_bytes" >&2
  exit 2
fi

if [[ ! -f $input ]]; then
  printf 'Input file does not exist: %s\n' "$input" >&2
  exit 1
fi

if ! ffmpeg -hide_banner -encoders 2>/dev/null | grep -q 'libwebp_anim'; then
  printf 'ffmpeg does not include the required libwebp_anim encoder.\n' >&2
  exit 1
fi

output_dir=$(dirname "$output")
mkdir -p "$output_dir"
temporary_output=$(mktemp "$output_dir/.webm-to-webp.XXXXXX.webp")
trap 'rm -f -- "$temporary_output"' EXIT

source_width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width \
  -of default=nokey=1:noprint_wrappers=1 "$input")
if ! [[ $source_width =~ ^[1-9][0-9]*$ ]]; then
  printf 'Could not determine the input width: %s\n' "$input" >&2
  exit 1
fi

# Target width (0 means original):quality, ordered from highest visual quality.
variants=(
  '0:90'
  '0:85'
  '0:82'
  '1100:85'
  '1000:85'
  '900:85'
  '800:85'
)

for variant in "${variants[@]}"; do
  width=${variant%%:*}
  quality=${variant##*:}

  # A width larger than the source would only upscale the video.
  if ((width > 0 && width >= source_width)); then
    continue
  fi

  if ((width == 0)); then
    width_label='original resolution'
  else
    width_label="${width}px"
  fi

  ffmpeg_args=(
    -y -hide_banner -loglevel error -i "$input"
  )
  if ((width > 0)); then
    ffmpeg_args+=( -vf "scale=${width}:-2:flags=lanczos" )
  fi
  ffmpeg_args+=(
    -c:v libwebp_anim -lossless 0 -q:v "$quality" -compression_level 4 -loop 0
    "$temporary_output"
  )

  printf 'Trying %s at quality %s...\n' \
    "$width_label" "$quality"
  ffmpeg "${ffmpeg_args[@]}"

  output_bytes=$(wc -c < "$temporary_output" | tr -d ' ')
  if ((output_bytes <= max_bytes)); then
    mv -f -- "$temporary_output" "$output"
    trap - EXIT
    printf 'Created %s (%s bytes; %s, quality %s)\n' \
      "$output" "$output_bytes" \
      "$width_label" "$quality"
    exit 0
  fi
done

printf 'Could not reach %s bytes. Try a narrower width or add lower-quality variants.\n' \
  "$max_bytes" >&2
exit 1
