---
title: autoinstall.yamlでUbuntu 24.04 LTSの初期設定を半自動化する
emoji: 🐧
type: tech
topics:
  - ubuntu
published: false
publication_name: bita
---
## はじめに

Ubuntu Desktop 24.04 LTSから、`autoinstall.yaml`を使った初期設定の自動化がUbuntuのインストーラーに追加されました。[^1]

実際に試して便利だったため、本記事では`autoinstall.yaml`からUbuntu Desktop 24.04.3 LTSの初期設定をする手順と`autoinstall.yaml`の作り方を紹介します。

なお、これからの文章では「Ubuntu Desktop 24.04.3 LTS」を「Ubuntu」と表記します。
タイトルの「半自動」は、`autoinstall.yaml`の設定項目に行くまでは手動で設定する必要があるためそのように表現しています。
<!-- textlint-disable ja-technical-writing/ja-no-mixed-period -->
:::message
Ubuntuをインストールするマシンとは別にもう一台のマシンが必要です。

もう一台のマシンは、同一LAN内にHTTPサーバを建てて`autoinstall.yaml`を公開するために使用します。ここで公開された`autoinstall.yaml`をインストール対象のマシンから読み取ります。
:::
<!-- textlint-enable ja-technical-writing/ja-no-mixed-period -->

[^1]: [Ubuntu 24.04 LTS (Noble Numbat) Release Notes - Project Discussion / Release - Ubuntu Community Hub](https://discourse.ubuntu.com/t/ubuntu-24-04-lts-noble-numbat-release-notes/39890#p-99950-installer-and-upgrades)

### 本記事で扱う内容

- `autoinstall.yaml`の使い方
- `autoinstall.yaml`を使ったUbuntuの設定方法
  - 具体的には、ユーザ作成・タイムゾーン設定・キーボード設定・ストレージ設定・パッケージインストール・インストール後に実行されるスクリプト

### 本記事で扱わない内容

- パーティション分割を伴うストレージの設定
- ネットワークの設定
- [サンプル設定](https://github.com/WATA-Haru/dotfiles/blob/2909bb328e6703c926de7e157986fcc26dfb07d8/ubuntu/autoinstall.sample.yaml)(後述)に書いていない項目の設定

## 筆者の`autoinstall.yaml`サンプル設定

サンプル設定だけ見たい方はこちらをご覧ください。
@[card](https://github.com/WATA-Haru/dotfiles/blob/2909bb328e6703c926de7e157986fcc26dfb07d8/ubuntu/autoinstall.sample.yaml)

## Ubuntuの`autoinstall.yaml`機能の概要

Ubuntuインストーラーを使った初期設定では、途中に以下のような画面が表示されます。
ここで「自動インストール」を選択するとYAMLファイルからマシンの初期設定ができます。

![対話式インストールと自動インストールの選択画面](/images/3e75e55aefaa4c/3e75e55aefaa4c-1766591650939.webp)

## `autoinstall.yaml`の設定

設定できるすべての項目は`autoinstall.yaml`の公式ドキュメントをご覧ください。
@[card](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html)

ここでは、私が作成した`autoinstall.sample.yaml`に沿って設定を紹介します。すべて解説すると長いので、重要な点だけ解説します。
@[card](https://github.com/WATA-Haru/dotfiles/blob/2909bb328e6703c926de7e157986fcc26dfb07d8/ubuntu/autoinstall.sample.yaml)

### source

`ubuntu-desktop`か`ubuntu-desktop-minimal`を選択できます。
`ubuntu-desktop`はLibreOfficeやThunderbirdなどを含みますが、私は使わないので`minimal`の方を選択しました。両者で含まれるパッケージの詳しい違いを知りたい方は以下を参照してください。

 [What is the difference between Ubuntu 24.04 Default (minimal) installation and Full installation? - Ask Ubuntu](https://askubuntu.com/questions/1511204/what-is-the-difference-between-ubuntu-24-04-default-minimal-installation-and-f)

### identity

[公式ドキュメント](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html#ai-identity)の設定を見ると、`realname`と`password`がシングルクォーテーション(`'`)で囲われているので、それに従って設定します。

```yaml: autoinstall.sample.yaml
  identity:
    hostname: ubuntu-desktop
    realname: '<your-name>'
    username: <your-name>
    password: '<your-password>'
```

注意点として、`password`を暗号化する必要があります。
私は[こちら](https://gihyo.jp/admin/serial/01/ubuntu-recipe/0818)に書いてあるのと同じ方法で、以下のコマンドで暗号化しました。

```shell
openssl passwd -6 <your-password>
```

その後、暗号化された出力結果を`password`に記載します。暗号化前のパスワードはログインする際に求められるので忘れないようにしましょう。

### packages

ここに入力したパッケージがインストール時に自動でインストールされます。
開発で絶対に使うようなパッケージは記載するとよいでしょう。

```yaml: autoinstall.yaml
  packages:
    - build-essential
    - ca-certificates
    - net-tools
    - gnupg
    - curl
    - wget
    - git
    - gh
    - zip
    - unzip
    - vim
    - tree
```

### storage

`storage`の設定を記載します。
今回はストレージをまるごと使用するので、`sizing-policy`に`all`を設定します。
`password`ですが、これは**暗号化が必要ありません**。

```yaml: autoinstall.yaml
  storage:
    layout:
      name: lvm
      sizing-policy: all
      password: <your-password>
```

### late-commands

Ubuntuのインストーラーは、インストールが正常に完了した後、更新とパッケージインストールを行います。その後、システムが再起動します。`late-commands`は、このシステムが再起動する直前に実行されるシェルコマンドです。

`curtin in-target`の後に続けてコマンドを書くとそれが実行されます。
今回は特にする処理もなかったので、aptのupdateだけを行っています。

```yaml: autoinstall.yaml
  late-commands:
    - curtin in-target -- apt update -y
```

## `autoinstall.yaml`を使用する手順

ここでは、先ほど作った`autoinstall.yaml`を読み込むまでの手順を解説します。
なお、インストールメディアの作成やBootMenuからの起動についての詳細は説明しません。

### Ubuntuのインストールから`autoinstall.yaml`の読み込み画面まで

Ubuntuをインストールメディアから起動し、Try or Install UbuntuでUbuntuをインストールします。
![Boot MenuでTry or Install Ubuntuを選択](/images/3e75e55aefaa4c/3e75e55aefaa4c-1766579523054.webp)
*Boot MenuでTry or Install Ubuntuを選択*

Ubuntuのインストーラーが立ち上がるので指示に沿って進みます。
なお、ここでキーボード設定や言語設定をしても、後から`autoinstall.yaml`の設定で上書きされます。

![Ubuntuのインストーラーの初期設定画面](/images/3e75e55aefaa4c/3e75e55aefaa4c-1766591903902.webp =450x)

同一LAN内のHTTPサーバから`autoinstall.yaml`を読み込むため、ネットワークの設定は必ずしてください。
![インターネットの接続方法を選択する画面](/images/3e75e55aefaa4c/3e75e55aefaa4c-1766592090113.webp =450x)

インストーラーの指示に従うと、一度インストーラーを閉じることになります。
いったん閉じたらインストーラーを再度立ち上げます。

そのまま進むと「対話式インストール」と「自動インストール(`autoinstall.yaml`)」を選択する画面が出てくるので、自動インストールを選択します。

![対話式インストールと自動インストールの選択画面で自動インストールを選択する様子](/images/3e75e55aefaa4c/3e75e55aefaa4c-1766592414419.webp =450x)
*自動インストールを選択*

### ローカルにHTTPサーバを立てて`autoinstall.yaml`をUbuntu側から読み取り可能にする

Ubuntu側から`autoinstall.yaml`を読み込むために、同一LAN内でHTTPサーバを立てる別のマシンが必要になります。そのため、以下の作業はUbuntuのインストール作業をしていない方のマシンで行います。

本記事ではWindowsのPowerShell上でPythonを使ってhttpサーバを立てる例を紹介します。WindowsにPythonをインストールする方法はこちらを参考にしてください。
@[card](https://www.python.jp/install/windows/install.html)

なお、今後の操作はOSによってコマンドが異なるため、適宜自分のマシンで使うものに読み替えてください。

まずはPowerShellから`cd`で`autoinstall.yaml`が置いてあるディレクトリに移動します。以下のように`autoinstall.yaml`があることを確認します。

```shell
PS C:\Users\name\dotfiles\ubuntu> ls


    Directory: C:\Users\name\dotfiles\ubuntu


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----        2025/12/24     20:51            659 autoinstall.sample.yaml
-a----        2025/12/23      2:44            744 autoinstall.yaml
```

次に、ローカルネットワークのIPv4アドレスを調べます。Windowsの場合は`ipconfig`を実行します。

```shell
PS C:\Users\name\dotfiles\ubuntu> ipconfig

Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . : <location>
   Link-local IPv6 Address . . . . . : <address>
   IPv4 Address. . . . . . . . . . . : 192.168.0.24
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.0.1
# 略
```

実行結果から、IPv4 Addressが`192.168.0.24`だと分かりました。

次に、Pythonで同一LAN内にHTTPサーバを立てます。
パブリックネットワークとプライベートネットワークで接続を許可するか確認するポップアップが出るので許可してください。サーバの使用後は接続許可の設定を元に戻します。(後述)

```shell
python -m http.server 8080
```

これで、他のローカルデバイスから`http://192.168.0.24:8080/autoinstall.yaml`にアクセスすると`autoinstall.yaml`の内容を読み取ることができるようになりました。
(他のデバイスから読み取る際はローカルサーバを起動させたままにしてください。)

### `autoinstall.yaml`から自動設定

Ubuntuのインストール作業をしているマシンに戻ります。
`autoinstall.yaml`をネットワーク経由で読み取るため、ローカルサーバのURLを入力します。
ここでは`http://192.168.0.24:8080/autoinstall.yaml`を入力します。

![ローカルサーバ上のautoinstall.yamlを入力](/images/3e75e55aefaa4c/3e75e55aefaa4c-1766594338173.webp =450x)
*ローカルサーバ上のautoinstall.yamlを読み取る*

以下のように`autoinstall.yaml`の確認画面が出るので、不備がないか確認して問題なければインストールに進みます。

![autoinstall.yamlの内容確認画面](/images/3e75e55aefaa4c/3e75e55aefaa4c-1766594555609.webp =450x)
*autoinstall.yamlの内容確認画面*

ここからはしばらく待ちます。もしエラーがある場合は以下の画像のようにエラーメッセージが表示されます。
![インストールのエラーメッセージ](/images/3e75e55aefaa4c/3e75e55aefaa4c-1766596326412.webp =450x)

`autoinstall.yaml`で設定した後は何も設定していなければ、自動で再起動されて設定が反映されます。
Ubuntu側の設定はこれで以上です。

### 使用後にファイアウォールのルールを削除する

`python -m http.server <port>`を許可すると、Windows Defenderファイアウォールに`python.exe`の受信許可ルールが作成されます。サーバを停止してもこのルールは残るため、不要になったら削除します。以下はWindowsでの例です。

管理者権限でPowerShellを起動し、`python.exe`に紐づく受信ルールを確認します。

```shell
# python.exe に紐づく受信ルールを一覧表示
$rules = Get-NetFirewallRule -Direction Inbound |
  Where-Object { $_.DisplayName -like "*python*" -or (($_ | Get-NetFirewallApplicationFilter).Program -like "*python.exe") }

$rules | ForEach-Object {
  $pf = $_ | Get-NetFirewallPortFilter
  [PSCustomObject]@{
    DisplayName = $_.DisplayName
    Enabled     = $_.Enabled
    Profile     = $_.Profile
    Protocol    = $pf.Protocol
    LocalPort   = $pf.LocalPort
    RemotePort  = $pf.RemotePort
  }
} | Format-Table -AutoSize
```

私の環境だと以下のように表示されました。

```txt
DisplayName Enabled Profile Protocol LocalPort RemotePort
----------- ------- ------- -------- --------- ----------
Python         True  Public TCP      Any       Any
Python         True  Public UDP      Any       Any
```

削除する場合は`Remove-NetFirewallRule`で`python.exe`に紐づくルールを削除します。

```powershell
# Pythonに紐づくルールを完全に削除する
Get-NetFirewallRule -Direction Inbound |
  Where-Object { $_.DisplayName -like "*python*" } |
  Remove-NetFirewallRule
```

## おわりに

<!-- textlint-disable ja-technical-writing/ja-no-doubled-joshi -->`autoinstall.yaml`は時間が経ってからインストールの失敗がわかり、トライアンドエラーがしにくいです。そのため、`autoinstall.yaml`には絶対に使う設定だけを書き、インストール後に自前のスクリプトで環境設定をするのがよいと感じました。
<!-- textlint-enable ja-technical-writing/ja-no-doubled-joshi -->

今回試した`autoinstall.yaml`は設定をコードで管理できる上に、覚えることも少ないため非常に便利でした。セットアップの際の参考になれば幸いです。

## 参考

@[card](https://gihyo.jp/admin/serial/01/ubuntu-recipe/0818)

@[card](https://github.com/WATA-Haru/dotfiles/blob/2909bb328e6703c926de7e157986fcc26dfb07d8/ubuntu/autoinstall.sample.yaml)

@[card](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html)
