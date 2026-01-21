#!/bin/zsh

Exp_Number=(1 2 3 4 ...)               # 各実験サーバーの番号
Host="server"                          # 実験サーバーの識別子，${Host}${Exp_Number[i]} で任意のサーバー指定
User="XXX"                        # ログインユーザー名

Path_ExeFile="./get_data_to_json.sh"   # ログイン先での実行ファイルパス
Path_JsonDir_In_Local="../json"        # ローカル保存用 jsonディレクトリパス

# 


# ssh及びscp エラー処理
process_error()
{
    cat <<-EOF > $1;    # 引数は書き込み先パス
	{
        "is_success":false
	}
	EOF
    exit 1
}

# ディレクトリ確認処理 ローカル保存用ディレクトリ
if [ ! -d "${Path_JsonDir_In_Local}" ] ; then
    mkdir "${Path_JsonDir_In_Local}"
fi

# 全サーバーに対して処理
for i in ${Exp_Number[@]}
do
    {
        # 各サーバー保存用 jsonファイルパス
        Path_JsonFile_In_Servers=".../development_env/management_servers/json/${Host}${i}.json"

        ssh -o ConnectTimeout=7 "${User}@${Host}${i}" 'sh -s' < "${Path_ExeFile}" "${i}"
        if [ $? -ne 0 ];
        then
            process_error "${Path_JsonDir_In_Local}/${Host}${i}.json"
        else
            scp -o ConnectTimeout=7 -i ~/.ssh/id_ed25519 "${User}@${Host}${i}:${Path_JsonFile_In_Servers}" "${Path_JsonDir_In_Local}"
            if [ $? -ne 0 ];
            then
                process_error "${Path_JsonDir_In_Local}/${Host}${i}.json"
            fi
        fi
    } &
done
wait