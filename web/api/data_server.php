<?php
# process_data_server.php: 依存関係, データ取得処理.
# server.html: サーバー名を受け取る.
# フロントエンドに返す.

header("Content-Type: application/json; charset=utf-8");
# フロントエンド側からの HTTP POST
$Json= file_get_contents("php://input");
# サーバー名
$ServerName= json_decode($Json, true);

# 依存関係先ファイルパス
include("../private/process_data_server.php");
echo json_encode($Contents_Array);
?>