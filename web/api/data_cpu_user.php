<?php
# process_data_cpu_user.php: 依存関係, データ取得処理.
# フロントエンドに返す.

header("Content-Type: application/json; charset=utf-8");
include("../private/process_data_cpu_user.php");
echo json_encode($Array_Data);
?>
