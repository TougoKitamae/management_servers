<?php
# data_server.php: 依存関係.
# 受け取ったサーバー名のjsonファイルパスを作成.
# それを元にjsonデータを取得し，data_server.php へ返す.

# 実運用パス
$Path_JsonDir_In_Local = ".../development_env/management_servers/json/";        # ローカル保存用 jsonディレクトリパス
# 公開用パス
$Path_JsonDir_Sample="../../json/";                                            # 公開jsonディレクトリパス

$Extension_Json=".json";                                                        # json拡張子
# $Path_JsonFile= $Path_JsonDir_In_Local.$ServerName["server"].$Extension_Json; # 実運用 フロントエンド 選択サーバーjspnファイルパス
$Path_JsonFile= $Path_JsonDir_Sample.$ServerName["server"].$Extension_Json;     # 公開用パス

$Contents_Json= file_get_contents($Path_JsonFile);
$Contents_Array = json_decode($Contents_Json,true);
?>