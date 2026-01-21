///////////////////// 1分経過判定
// 一分経過するまでの秒数 求める
function outputRemainTimeTillPassAMinute(time)  // time: 現在時刻
{
    const nowSeconds = time.getSeconds();
    const secondsInAMinute = 60;
    const millisecondsInASecond = 1000;
    const delay= 15;
    const remainTime = ((secondsInAMinute-nowSeconds+delay)*millisecondsInASecond);
    console.log("1分経過まで"+(remainTime/millisecondsInASecond));
    return remainTime;
}

///////////////////// 各サーバーデータの取得及び，設置処理
// URLクエリのパラメータを取得
function getURLParam(){
    const params = new URLSearchParams(document.location.search);
    const value = params.get("server");
    //console.log(value);
    return value;
}
// データのやり取り，HTTP通信
async function httpPostJson(){
    const serverName = getURLParam();   // 選択サーバー名を取得
    const data = {server: serverName};
    const res = await fetch("/api/data_server.php", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    const json = await res.json();
    return json;
}
// jsonデータの設置，表示処理
function setJsonData(data){
    // 最終更新日時データ
    const elementUpdateTime = document.getElementById("data_latest_update");
    elementUpdateTime.textContent = data.update_time;

    // CPU使用率データ
    const parentCpu = document.getElementById("parent_cpu");
    const elementCpu = [...parentCpu.querySelectorAll("td")];
    elementCpu[0].textContent = data.cpu["us"];
    elementCpu[1].textContent = data.cpu["sy"];
    elementCpu[2].textContent = data.cpu["id"];
    elementCpu[3].textContent = data.cpu["wa"];
    elementCpu[4].textContent = data.cpu["st"];

    // メモリ使用量
    // Mem
    const parentMem = document.getElementById("parent_mem");
    const elementMem = [...parentMem.querySelectorAll("td")];
    elementMem[1].textContent = data.memory["Mem"][0]["total"];
    elementMem[2].textContent = data.memory["Mem"][0]["used"];
    elementMem[3].textContent = data.memory["Mem"][0]["free"];
    elementMem[4].textContent = data.memory["Mem"][0]["shared"];
    elementMem[5].textContent = data.memory["Mem"][0]["buff/cache"];
    elementMem[6].textContent = data.memory["Mem"][0]["available"];
    // Swap
    const parentSwap = document.getElementById("parent_swap");
    const elementSwap = [...parentSwap.querySelectorAll("td")];
    elementSwap[1].textContent = data.memory["Swap"][0]["total"];
    elementSwap[2].textContent = data.memory["Swap"][0]["used"];
    elementSwap[3].textContent = data.memory["Swap"][0]["free"];

    // プロセス状況
    for(let i = 0; i < data.process["number"]; i++){
        const trProcess = document.createElement("tr");
        trProcess.className = "data_process";
        trProcess.innerHTML = `
            <td>${data.process["contents"][i]["user"]}</td>
            <td>${data.process["contents"][i]["command"]}</td>
            <td>${data.process["contents"][i]["time_start"]}</td>
            <td>${data.process["contents"][i]["pid"]}</td>
            <td>${data.process["contents"][i]["tty"]}</td>
            <td>${data.process["contents"][i]["stat"]}</td>
            <td>${data.process["contents"][i]["cpu"]}</td>
            <td>${data.process["contents"][i]["mem"]}</td>
        `;
        const parentProcess = document.getElementById("parent_process");
        parentProcess.appendChild(trProcess);
    }

    // ログイン状況
    // ユーザー数
    const elementLoginUserNumber = document.getElementById("data_login_user_number");
    elementLoginUserNumber.textContent = data.login_user["number"];
    // ユーザー名
    for(let i = 0; i < data.login_user["number"]; i++){
        const tdLoginUserName = document.createElement("td");
        tdLoginUserName.className = "data_login_user_name";
        tdLoginUserName.innerHTML = `
            ${data.login_user["name"][i]}
        `;
        const parentLoginUserName = document.getElementById("parent_login_user_name");
        parentLoginUserName.appendChild(tdLoginUserName);
    }

    // ログイン履歴
    for(let i = 0; i < 20; i++){
        const tdLoginLog = document.createElement("tr");
        tdLoginLog.className = "data_login_log";
        tdLoginLog.innerHTML = `
            <td>${data.login_log[i]["name"]}</td>
            <td>${data.login_log[i]["date"]}</td>
            <td>${data.login_log[i]["login_time"]}</td>
            <td>${data.login_log[i]["logout_time"]}</td>
            <td>${data.login_log[i]["device"]}</td>
            <td>${data.login_log[i]["host"]}</td>
        `;
        const parentLoginLog = document.getElementById("parent_login_log");
        parentLoginLog.appendChild(tdLoginLog);
    }
}
// 作成 追加したHTML要素 削除
function deleteElemHtml(){
    // プロセス状況
    [...document.getElementsByClassName("data_process")].forEach(tr => tr.remove());

    // ログイン状況
    // ユーザー名
    [...document.getElementsByClassName("data_login_user_name")].forEach(td => td.remove());

    // ログイン履歴
    [...document.getElementsByClassName("data_login_log")].forEach(tr => tr.remove());
}
///////////////////// main /////////////////////
async function main(){
    // 変数宣言
    const header = document.getElementById("page_header");
    const title = document.getElementById("page_title");
    const serverName = getURLParam();                               // 選択サーバー名を取得
    const nowTime = new Date();
    const remainTime = outputRemainTimeTillPassAMinute(nowTime);

    // 実行部分
    header.textContent = "実験サーバー："+serverName;
    title.textContent = "実験サーバー："+serverName;

    const data = await httpPostJson();
    setJsonData(data);

    setTimeout(async ()=>{
        console.log("1分経過");
        deleteElemHtml();
        const data = await httpPostJson();
        setJsonData(data);

        setInterval(async ()=>{
            console.log("1分経過");
            deleteElemHtml();
            const data = await httpPostJson();
            setJsonData(data);
        }, 60*1000);
    ;}, remainTime);
}
main();