///////////////////// URLクエリ 処理
// URLクエリ 作成
function makeParam(value)           // value: サーバー番号
{
    const param = new URLSearchParams({server: value});
    return param;
}
// URL+URLクエリ 作成
function makeUrl(param, url)        // param: 上部関数(makeParam)での戻り値, url: 遷移先URL
{
    const paramUrl = url+param;
    return paramUrl;                // 遷移先URL(クエリパラ 付与)
}
// URL(クエリパラ 付与) へ遷移
function transitionNextPage(e, url)
{
    const param = makeParam(e.target.id);
    const paramUrl = makeUrl(param, url);
    location.replace(paramUrl);
}

///////////////////// データ取得http通信 処理
// グローバルな状態監視
const appState ={
    latestJson: null,               // webAPI通信で受け取ったデータ 以下の3つ
    latestArraryCpu: null,          // latestJsonの要素 CPU使用率
    latestArraryUserNumber: null,   // latestJsonの要素 ログインユーザー数
    latestArraryUserName: null,     // latestJsonの要素 ログインユーザー名
    hoveringIndex: null             // ホバーしたelementTdのindex
};
// CPU使用率可視化，ホバーウィンド 利用データ 取得
async function httpGetJson(){
    const res = await fetch("/api/data_cpu_user.php");
    const json = await res.json();
    return json;
}

///////////////////// CPU使用率可視化 処理
// CPU使用率に基づいた ボタン色変更
async function setColorInButton(elem, array, params){   // elem:色の変更対象配列, array:CPU使用率の配列, params:変更する色の連想配列
    for(let i = 0; i < elem.length; i++){
        const color = await judgementColor(array[i], params);
        elem[i].style.backgroundColor = color;
    }
    console.log("ボタン色変更");
}
// 各CPU使用率に対応した 変更色 適応
async function judgementColor(cpuParam, colorParams){       // cpuParam:CPU使用率の値 上部関数のarray配列の要素, colorParams:上部関数のparams
    if(cpuParam == null){
        return colorParams.null;
    }else if(cpuParam <= 20){
        return colorParams.low;
    }else if(cpuParam <= 40 & cpuParam > 20){
        return colorParams.low_mid;
    }else if(cpuParam <= 60 & cpuParam > 41){
        return colorParams.mid;
    }else if(cpuParam <= 80 & cpuParam > 61){
        return colorParams.high_mid;
    }else if(cpuParam <= 100 & cpuParam > 81){
        return colorParams.high;
    }
}
// http通信 取得データ 配列化
async function setHttpData(){
    latestJson = await httpGetJson();
    latestArraryCpu = latestJson.map(n => n.cpu);                   // CPU使用率
    latestArraryUserNumber = latestJson.map(n => n.user.number);    // ログインユーザー数
    latestArraryUserName = latestJson.map(n => n.user.name);        // ログインユーザー名
}
// CPU使用率と色の対応表 色変更
function setColorInSample(colorParams){
    document.getElementById("color_sample_fail").style.backgroundColor = colorParams.null;
    document.getElementById("color_sample_low").style.backgroundColor = colorParams.low;
    document.getElementById("color_sample_lowmid").style.backgroundColor = colorParams.low_mid;
    document.getElementById("color_sample_mid").style.backgroundColor = colorParams.mid;
    document.getElementById("color_sample_highmid").style.backgroundColor = colorParams.high_mid;
    document.getElementById("color_sample_high").style.backgroundColor = colorParams.high;
}

///////////////////// 1分経過判定
// ページ初表示の時刻から 一分後まで 秒数
function outputRemainTimeTillPassAMinute(time)  // time: 現在時刻
{
    const nowSeconds = time.getSeconds();
    const secondsInAMinute = 60;
    const millisecondsInASecond = 1000;
    const delay= 15;
    const remainTime = ((secondsInAMinute-nowSeconds+delay)*millisecondsInASecond);
    //console.log("1分経過まで"+(remainTime/millisecondsInASecond));
    return remainTime;
}

///////////////////// ホバーイベント
// 対象要素を指定ポジション 設置
function setElementInPosition(elem, pos, add_top, add_left, add_width, add_height)  // 対象要素elemを任意の場所に配置する
{
    elem.style.top = pos.top+add_top+"px";
    elem.style.left = pos.left+add_left+"px";
    elem.style.width = pos.width+add_width+"px";
    //elem.style.height = pos.height+add_height+"px";
}
function showElement(elem)
{
    elem.style.opacity = "1";
}
function hideElement(elem)
{
    elem.style.opacity = "0";
}
// サブウィンドウ内のテキスト 作成
function makeText(titleCpu, textCpu, titleUsernumber, textUsernumber, titleUsername, textUsername)
{
    const index = appState.hoveringIndex; 
    // test
    titleCpu.style.fontSize = "20px";
    textCpu.style.fontSize = "20px";

    if(latestArraryCpu[index] == null){             // データ取得失敗時
        // CPU使用率
        titleCpu.textContent = "データ取得失敗";
        textCpu.textContent = "";
        // ログインユーザー数
        titleUsernumber.textContent = "";
        textUsernumber.textContent = "";
        // ログインユーザー名
        titleUsername.textContent = "";
        textUsername.textContent = "";
    }else if(latestArraryUserName[index] == null){  // ログインユーザー なし
        // CPU使用率
        titleCpu.textContent = "CPU使用率";
        textCpu.textContent = latestArraryCpu[index]+"(%)";
        // ログインユーザー数
        titleUsernumber.textContent = "ログインユーザー数";
        textUsernumber.textContent = "0";
        // ログインユーザー名
        titleUsername.textContent = "ログインユーザー名";
        textUsername.textContent = "なし";
    }else{                                          // ログインユーザー あり
        // CPU使用率
        titleCpu.textContent = "CPU使用率";
        textCpu.textContent = latestArraryCpu[index]+"(%)";
        // ログインユーザー数
        titleUsernumber.textContent = "ログインユーザー数";
        textUsernumber.textContent = latestArraryUserNumber[index];
        // ログインユーザー名
        titleUsername.textContent = "ログインユーザー名";
        textUsername.textContent = latestArraryUserName[index];
    }
}

///////////////////// main /////////////////////
async function main(){
    // 変数宣言 //
    // 1分経過判定
    const nowTime = new Date();
    const remainTime = outputRemainTimeTillPassAMinute(nowTime);
    const millisecondsInAMinute = 60000;
    // URLクエリ
    const nextUrl = "/server.html?";      // 遷移先URL
    // ホバーイベント
    const elementTagA = document.getElementsByTagName("a");
    const elementTd = document.getElementsByClassName("table_elem");
    const divTableServers = document.getElementById("tableAll");                            // サーバー表 全体
    // データ可視化処理
    const elementOverlay = document.getElementById("overlay");                              // ボタンホバー時 表示 不透明要素
    const elementSubDataWindow = document.getElementById("sub_windows");                    // ボタンホバー時 表示 データ表示要素
    const colorParams = {                                                                   // 各CPU使用率に対応する色
        null: "#dfdfdf",
        low: "rgba(0, 207, 253, 1)",
        low_mid: "rgba(0, 253, 114, 1)",
        mid: "rgba(255, 237, 45, 1)",
        high_mid: "rgba(255, 160, 45, 1)",
        high: "rgba(255, 45, 45, 1)"
    };
    // サブウィンドウ テキスト
    const titleCpu = document.getElementById("title_cpu");                                    // タイトル CPU使用率
    const textCpu = document.getElementById("text_cpu");                                      // テキスト 同上
    const titleLoginUserNumber = document.getElementById("title_login_user_number");          // タイトル ログインユーザー数
    const textLoginUserNumber = document.getElementById("text_login_user_number");            // テキスト 同上
    const titleLoginUserName = document.getElementById("title_login_user_name");              // タイトル ログインユーザー名
    const textLoginUserName = document.getElementById("text_login_user_name");                // テキスト 同上
    
    // 実行部分 //
    setColorInSample(colorParams);
    // イベント発火部分
    for(let i = 0; i < elementTd.length; i++){ 
        elementTagA[i].addEventListener("click", (e)=>{transitionNextPage(e, nextUrl);}, false);
        elementTd[i].addEventListener("mouseenter", (e)=>{
            appState.hoveringIndex = i;
            //console.log(appState.hoveringIndex);
            const positionTd = e.target.getBoundingClientRect();
            // ホバー要素の位置に基く 指定要素の設置および表示
            setElementInPosition(elementOverlay, positionTd, 0, 0, 0, 0);
            showElement(elementOverlay);
            setElementInPosition(elementSubDataWindow, positionTd, positionTd.height, 0, 0, 0);
            showElement(elementSubDataWindow);
            // サブウィンドウ テキスト更新
            makeText(titleCpu, textCpu, titleLoginUserNumber, textLoginUserNumber, titleLoginUserName, textLoginUserName);
            // 表示アニメーションの対象要素 指定用
            elementSubDataWindow.classList.add("show");
        }, false);
    }
    divTableServers.addEventListener("mouseleave", ()=>{
        appState.hoveringIndex = null;
        // 指定要素 非表示
        hideElement(elementOverlay);
        hideElement(elementSubDataWindow);
        // 表示アニメーションの対象要素 取り外し
        elementSubDataWindow.classList.remove("show");
    }, false);

    await setHttpData();
    setColorInButton(elementTd, latestArraryCpu, colorParams);
    if (appState.hoveringIndex !== null)                            // elemにホバー中でもデータ更新された場合に値の更新を行う処理
    {
        makeText(titleCpu, textCpu, titleLoginUserNumber, textLoginUserNumber, titleLoginUserName, textLoginUserName);
    }

    setTimeout(async ()=>{
        console.log("1分経過");
        await setHttpData();
        setColorInButton(elementTd, latestArraryCpu, colorParams);
        if (appState.hoveringIndex !== null)
        {
            makeText(titleCpu, textCpu, titleLoginUserNumber, textLoginUserNumber, titleLoginUserName, textLoginUserName);
        }

        setInterval(async ()=>{
            console.log("1分経過");
            await setHttpData();
            setColorInButton(elementTd, latestArraryCpu, colorParams);
            if (appState.hoveringIndex !== null)
            {
                makeText(titleCpu, textCpu, titleLoginUserNumber, textLoginUserNumber, titleLoginUserName, textLoginUserName);
            }
        }, millisecondsInAMinute);
    }, remainTime);
}
main();