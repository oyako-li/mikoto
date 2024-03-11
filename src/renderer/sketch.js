var myRec = new p5.SpeechRec(); // new P5.SpeechRec object
var is_recognition_activated = false;

var words = [];

function setup() {
  // キャンバスは使わない
  noCanvas();

  // スピーチの切れ目があったときに呼び出す関数を登録
  myRec.onEnd = endSpeech;
  
  // 随時音声入力をテキスト化する際に呼び出される関数を登録
  myRec.onResult = parseResult;

  // 連続した音声認識は行わない．プログラム内で適時音声認識のstopとstartを制御する
  myRec.continuous = false; // no continuous recognition

  // 読み上げている最中の認識途中の文字列も利用する場合
  myRec.interimResults = true; // allow partial recognition (faster, less accurate)

  // プログラム制御用変数（true: 音声認識利用中を示す）
  is_recognition_activated = false;

  // 認識言語は日本語
  myRec.rec.lang = "ja";

  // start/stop のDOMボタンを押したときに音声認識切り替えを行う
  select("#label").mouseClicked(toggleSpeechRecognition);
}

// 認識途中随時呼び出される関数（認識途中の文字列を取得できる）
function parseResult() {
  document.getElementById("label").innerHTML = "speaking...";
  document.getElementById("interim_span").value = myRec.resultString;
}

function toggleSpeechRecognition() {
  
  // 認識ステータスを反転させる（trueならfalse，falseならtrue）
  is_recognition_activated = !is_recognition_activated;

  // 音声認識アクティベート
  if (is_recognition_activated == true) {
    myRec.rec.lang = "ja"; // 日本語認識
    myRec.start(); // 認識スタート
    this.html("stop"); //ボタンの表示をstopにする
  }
  // 音声認識を停止させる
  else {
    // 音声認識をとめる
    myRec.stop();
    // ボタンの表示をstartにする
    this.html("start");
  }
}

function endSpeech() {
  
  // 音声認識アクティベート中なら
  if (is_recognition_activated == true) {
    
    // 認識文字列に何も入っていなければ（タイムアウトでendSpeechになった場合）
    if (!myRec.resultValue) {
      myRec.start(); // start engine
      return;
    }
    
    // 認識文字列になんか入ってれば
    if (myRec.resultString.length > 0) {
      console.log("End");
      document.getElementById("label").innerHTML = "quiet";
      document.getElementById("final_span").innerHTML +=
        myRec.resultString + "。<br/>";
      document.getElementById("text").value = "";
      console.log(myRec.resultString);
      myRec.resultString = "";
    }
    myRec.start(); // start engine
    console.log("start");
  }
}