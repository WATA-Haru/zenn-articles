# zenn-connect

## WebMをGIFに変換する

`ffmpeg` と `ffprobe` をインストールした環境で、以下を実行します。

```bash
scripts/webm-to-gif.sh input.webm output.gif
```

デフォルトでは、横幅を500px（縦横比を維持）にし、GIFの容量を3,000,000 bytes以下にします。容量が上限を超える場合は、画質を優先しながらフレームレートと色数を段階的に調整します。

出力幅と容量の上限は変更できます。

```bash
scripts/webm-to-gif.sh --width 640 --max-bytes 3000000 input.webm output.gif
```

利用可能なオプションは次で確認できます。

```bash
scripts/webm-to-gif.sh --help
```

## WebMをアニメーションWebPに変換する

GIFの256色制限を避け、元動画のフレームタイミングを保つには、アニメーションWebPを使えます。

```bash
scripts/webm-to-webp.sh input.webm output.webp
```

出力は無限ループします。元解像度・品質90から順に調整し、デフォルトではZennの画像上限を考慮して2,900,000 bytes以下にします。

上限を変更する場合は、`--max-bytes`を指定します。

```bash
scripts/webm-to-webp.sh --max-bytes 2500000 input.webm output.webp
```
