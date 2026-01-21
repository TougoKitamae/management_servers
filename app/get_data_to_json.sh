#!/bin/zsh

Exp_Number=$1	# 実験サーバーの番号
Path_JsonDir_In_Servers=".../development_env/management_servers/json"	# 各サーバー保存用 jsonディレクトリパス

### 関数定義 ###
# ssh及びscp 成功処理
process_success()
{
	cat <<-EOF >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
	        "is_success":true,
	EOF
}
# データ取得時間の取得
get_update_time()
{
	local Date=`TZ='Asia/Tokyo' date "+%Y/%m/%d %H:%M:%S"`;	# 年/月/日 時:分:秒 という表示仕様
	cat <<-EOF >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
	        "update_time":${Date},
	EOF
}
# サーバーのログインユーザー情報を取得
get_login_user()
{
	local Number
	local Name
	local Name_List
	Number=$(who -q | sed -n 2p | cut -f 2 -d "=")
	# 以下 NAme_Listの作成処理
	if [ "${Number}" = 0 ] ; then
		Name_List=null
	else
		Name_List="["
		for i in `seq ${Number}`
		do
			Name=$(who -q | head -n 1 | cut -f ${i} -d " ")	# ログインユーザー名（i番目）
			Name_List="${Name_List}\"${Name}\""			    # 文字列 NAme_List に Name を追加

			if [ "${i}" != "${Number}" ] ; then					# 最後尾判定
				Name_List="${Name_List},"
			fi
		done
		Name_List="${Name_List}]"
	fi
	cat <<-EOF >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
	        "login_user":{
	                "number":${Number},
	                "name":${Name_List}
	        },
	EOF
}
# サーバーのログイン履歴を取得
get_login_log()
{
	local Name
	local Date
	local Login_Time
	local Logout_Time
	local Pseudo_Terminal_Num
	local Host

	echo "\t\"login_log\":[" >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
	for i in `seq 20` # 最新20件を取得
	do

		Name=$(last -20 | sed -n ${i}p | awk '{print $1}')
		Date=$(last -20 | sed -n ${i}p | awk '{print $5"/"$6"/"$4}')
		Login_Time=$(last -20 | sed -n ${i}p | awk '{print $7}')
		Logout_Time=$(last -20 | sed -n ${i}p | awk '{print $9}')
		Pseudo_Terminal_Num=$(last -20 | sed -n ${i}p | awk '{print $2}')
		Host=$(last -20 | sed -n ${i}p | awk '{print $3}')

		cat <<-EOF >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
		                {
		                        "name":"${Name}",
		                        "date":"${Date}",
		                        "login_time":"${Login_Time}",
		                        "logout_time":"${Logout_Time}",
		                        "device":"${Pseudo_Terminal_Num}",
		                        "host":"${Host}"
		EOF

		if [ ${i} != 20 ] ; then # 最後尾判定
			echo  "\t\t}," >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
		else
			echo  "\t\t}" >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
        fi
	done
	echo "\t]," >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
}
# サーバーのCPU使用率を取得
get_cpu()
{
	local Us=$(vmstat | sed -n 3p | awk '{print $13}')
	local Sy=$(vmstat | sed -n 3p | awk '{print $14}')
	local Id=$(vmstat | sed -n 3p | awk '{print $15}')
	local Wa=$(vmstat | sed -n 3p | awk '{print $16}')
	local St=$(vmstat | sed -n 3p | awk '{print $17}')
	local Gu=$(vmstat | sed -n 3p | awk '{print $18}')

	cat <<-EOF >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
	        "cpu":{
	                "us":${Us},
	                "sy":${Sy},
	                "id":${Id},
	                "wa":${Wa},
	                "st":${St},
	                "gu":${Gu}
	        },
	EOF
}
# サーバーのメモリ使用量を取得
get_memory()
{   
	local Total
    local Used
    local Free
	local Shared
    local Buff_Cache
    local Available

	echo "\t\"memory\":{" >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
	# 以下 Mem, Swap の切り替え
	for i in `seq 2`
	do
		if [ ${i} = 1 ] ; then # i=1はMem i=1はSwap
			echo "\t\t\"Mem\":[" >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
		else
			echo "\t\t\"Swap\":[" >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
		fi

		Total=$(free -h | sed -n $((i + 1))p | awk '{print $2}')
		Used=$(free -h | sed -n $((i + 1))p | awk '{print $3}')
		Free=$(free -h | sed -n $((i + 1))p | awk '{print $4}')
		Shared=$(free -h | sed -n $((i + 1))p | awk '{print $5}')
		Buff_Cache=$(free -h | sed -n $((i + 1))p | awk '{print $6}')
		Available=$(free -h | sed -n $((i + 1))p | awk '{print $7}')

		cat <<-EOF >> "${Path_JsonFile_In_Servers}/exp${Exp_Number}.json"
		                        {
		                                "total":"${Total}",
		                                "used":"${Used}",
		                                "free":"${Free}",
		                                "shared":"${Shared}",
		                                "buff/cache":"${Buff_Cache}",
		                                "available":"${Available}"
		                        }
		EOF

		if [ ${i} = 1 ] ; then # 最後尾判定
			echo "\t\t]," >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
		else
			echo "\t\t]" >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
		fi
	done
	echo "\t}," >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
}
# サーバーのプロセス情報を取得
get_process()
{
	local User
	local Command
	local Time_Start
	local Pid
	local Tty
	local Stat
	local Cpu
	local Mem
	local Number_Row
	Number_Row=$(ps -au | wc -l)
    Number_Row=$((Number_Row -1))

	cat <<-EOF >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
	        "process":{
	                "number":${Number_Row},
	                "contents":[
	EOF
	# 以下 個々のプロセス情報を取得
	for i in `seq ${Number_Row} `
	do
        User=$(ps -au | sed -n $((i + 1))p | awk '{print $1}')
		#Command=$(ps -au | sed -n $((i + 1))p | awk '{for(i = 11; i <= NF; i++) printf "%s%s", $i, (i<NF?OFS:ORS) }')
		Command=$(ps -au | sed -n 3p | awk '{for(i = 11; i <= NF; i++) printf "%s%s", $i, (i<NF?OFS:ORS) }' | jq -R )
		Time_Start=$(ps -au | sed -n $((i + 1))p | awk '{print $9}')
		Pid=$(ps -au | sed -n $((i + 1))p | awk '{print $2}')
		Tty=$(ps -au | sed -n $((i + 1))p | awk '{print $7}')
		Stat=$(ps -au | sed -n $((i + 1))p | awk '{print $8}')
		Cpu=$(ps -au | sed -n $((i + 1))p | awk '{print $3}')
		Mem=$(ps -au | sed -n $((i + 1))p | awk '{print $4}')

		cat <<-EOF >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
		                        {
		                                "user":"${User}",
		                                "command":${Command},
		                                "time_start":"${Time_Start}",
		                                "pid":"${Pid}",
		                                "tty":"${Tty}",
		                                "stat":"${Stat}",
		                                "cpu":"${Cpu}",
		                                "mem":"${Mem}"
		EOF

		if [ ${i} != ${Number_Row} ]; then # 最後尾判定
			echo  "\t\t\t}," >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
		else
			echo  "\t\t\t}" >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
    	fi
	done

	echo "\t\t]" >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json"
	echo "\t}" >> "${Path_JsonFile_In_Servers}/server${Exp_Number}.json" # 注意箇所 json内で最後の要素より ], でなく ]
}


### main ###

# ディレクトリ確認処理 各サーバー保存用ディレクトリ
if [ ! -d "${Path_JsonFile_In_Servers}" ] ; then
    mkdir -p "${Path_JsonFile_In_Servers}"
fi

# データ取得処理
# hostname
echo "{" > "${Path_JsonFile_In_Servers}"
process_success
get_update_time
get_login_user
get_login_log
get_cpu
get_memory
get_process
echo "}" >> "${Path_JsonFile_In_Servers}"