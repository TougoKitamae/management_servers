<?php
# data_cpu_user.php: 依存関係.
# 全サーバーの CPU使用率，ログインユーザー数，ログインユーザー名を取得し，data_cpu_user.php へ返す

# 実運用パス
$Path_JsonDir_In_Local = ".../development_env/management_servers/json/"; # ローカル保存用 jsonディレクトリパス
# 公開用パス
$Path_JsonDir_Sample="../../json/";

$Extension_Json=".json";
$Array_ServerName= ["server1", "server2", "server3", "server4", "server5", "server6", "server7", "server8", "server9", "server10", "server11", "server12", "server13", "server14"];
$Array_Data= [];   # 初期化 CPU使用率，ログインユーザー数，ログインユーザー名
$Size_Array_ServerName= count($Array_ServerName);
for($i = 0; $i < $Size_Array_ServerName; $i++)
{
    # $Path_JsonFile= $Path_JsonDir_In_Local.$Array_ServerName[$i].$Extension_Json;
    $Path_JsonFile= $Path_JsonDir_Sample.$Array_ServerName[$i].$Extension_Json;
    
    $Contents_Json= file_get_contents($Path_JsonFile);
    $Contents_Array = json_decode($Contents_Json,true);
    if($Contents_Array["is_success"] == true){
        $Array_Data[$i]=["server" => $Array_ServerName[$i], "cpu" => 100-$Contents_Array["cpu"]["id"], "user" => ["number" => $Contents_Array["login_user"]["number"], "name" => $Contents_Array["login_user"]["name"]]];
    }else{
        $Array_Data[$i]=["server" => $Array_ServerName[$i], "cpu" => null, "user" => ["number" => null, "name" => null]];
    }
}
?>