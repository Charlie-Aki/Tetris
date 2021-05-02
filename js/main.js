/* Variable Initialization */
let count = 3; //3秒前からカウントダウンスタート
let cells;
let isFalling = false; //落下中のブロックあり(初期設定)
let fallingBlockNum = 0;

//ブロックのパターン
let blocks = {
  i: {
    class: 'i',
    pattern: [
      [1, 1, 1, 1]
    ]
  },
  o: {
    class: 'o',
    pattern: [
      [1, 1],
      [1, 1]
    ]
  },
  t: {
    class: 't',
    pattern: [
      [0, 1, 0],
      [1, 1, 1]
    ]
  },
  s: {
    class: 's',
    pattern: [
      [0, 1, 1],
      [1, 1, 0]
    ]
  },
  z: {
    class: 'z',
    pattern: [
      [1, 1, 0],
      [0, 1, 1]
    ]
  },
  j: {
    class: 'j',
    pattern: [
      [1, 0, 0],
      [1, 1, 1]
    ]
  },
  l: {
    class: 'l',
    pattern: [
      [0, 0, 1],
      [1, 1, 1]
    ]
  }
};

/* Main Program */
document.addEventListener('keydown', onKeyDown); //キーボードのイベントを監視してonKeyDown関数に渡す

let idCountDown = setInterval(function () {
  document.getElementById('id_Count').textContent = '開始まで' + count + '秒';
  count--;

  if (count < 1) {
    clearInterval(idCountDown);

    loadTable();
    let idCountUp = setInterval(function () {
      document.getElementById('id_Count').textContent = '経過時間: ' + count + '秒';
      count++;

      if (hasFallingBlock()) {
        fallBlocks();
      } else {
        deleteRow();
        checkSustainability(idCountUp);
        generateBlock();
      }

    }, 1000);

  }
}, 1000);

/* Functions */
function loadTable() {
  /* テーブルの要素を取得して配列化 */
  cells = [];
  let td_array = document.getElementsByTagName('td'); //row x 20, column x 10の200個の要素を持つ配列
  let index = 0;
  for (let row = 0; row < 20; row++) {
    cells[row] = []; //配列のそれぞれの要素を配列にする(2次元配列にする)
    for (let col = 0; col < 10; col++) {
      cells[row][col] = td_array[index];
      index++;
    }
  }
}

function fallBlocks() {
  /* ブロックを落とす */
  //底についていないか確認
  for (let col = 0; col < 10; col++) {
    if (cells[19][col].blockNum === fallingBlockNum) {
      isFalling = false;
      return; //一番下の行にブロックがいるので落とさない
    }
  }
  //一マス下に別のブロックがないか確認
  for (let row = 18; row >= 0; row--) {
    for (let col = 0; col < 10; col++) {
      if (cells[row][col].blockNum === fallingBlockNum) {
        if (cells[row + 1][col].className !== '' && cells[row + 1][col].blockNum !== fallingBlockNum) {
          isFalling = false;
          return; //一つ下のマスにブロックがいるので落とさない
        }
      }
    }
  }
  //下から二番目の行から繰り返しクラスを下げていく
  for (let row = 18; row >= 0; row--) {
    for (let col = 0; col < 10; col++) {
      if (cells[row][col].blockNum === fallingBlockNum) {
        cells[row + 1][col].className = cells[row][col].className;
        cells[row + 1][col].blockNum = cells[row][col].blockNum;
        cells[row][col].className = '';
        cells[row][col].blockNum = null;
      }
    }
  }
}

function hasFallingBlock() {
  /* 落下中のブロックがあるか確認する */
  return isFalling;
}

function deleteRow() {
  /* そろっている行を消す */
  for (let row = 19; row >= 0; row--) {
    let canDelete = true;
    for (let col = 0; col < 10; col++) {
      if (cells[row][col].className === '') {
        canDelete = false;
      }
    }
    if (canDelete) {
      //一行消す
      for (let col = 0; col < 10; col++) {
        cells[row][col].className = '';
      }
      //上の行のブロックをすべて一マス落とす
      for (let downRow = row - 1; downRow >= 0; downRow--) {
        for (let col = 0; col < 10; col++) {
          cells[downRow + 1][col].className = cells[downRow][col].className;
          cells[downRow + 1][col].blockNum = cells[downRow][col].blockNum;
          cells[downRow][col].className = '';
          cells[downRow][col].blockNum = null;
        }
      }
    }
  }
}

function checkSustainability (id, msg = 'Game Over') {
  //ブロックが積み上がり切っていないかのチェック
  for (let col = 3; col < 7; col++) {
    if (cells[0][col].className !== '') {
      clearInterval(id)
      if (!alert(msg)) {
        location.reload();
      }
    }
  }
}

function generateBlock() {
  /* ランダムにブロックを生成する */
  let keys = Object.keys(blocks);
  let nextBlockKey = keys[Math.floor(Math.random() * keys.length)];
  let nextBlock = blocks[nextBlockKey];
  let nextFallingBlockNum = fallingBlockNum + 1;

  let pattern = nextBlock.pattern;
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      if (pattern[row][col]) {
        cells[row][col + 3].className = nextBlock.class;
        cells[row][col + 3].blockNum = nextFallingBlockNum
      }
    }
  }
  isFalling = true;
  fallingBlockNum = nextFallingBlockNum;
}

function moveLeft () {
  /* ブロックを左に移動させる */
  //一番左が壁になっていないか確認
  for (let row = 0; row < 20; row++) {
    if (cells[row][0].blockNum === fallingBlockNum) {
      return; //一番左の行にブロックがいるので左キーを受け付けない
    }
  }
  //一マス左に別のブロックがないか確認
  for (let col = 1; col < 10; col++) {
    for (let row = 0; row < 20; row++) {
      if (cells[row][col].blockNum === fallingBlockNum) {
        if (col > 0 && cells[row][col - 1].className !== '' && cells[row][col -1 ].blockNum !== fallingBlockNum) {
          return; //一つ左のマスにブロックがいるので左キーを受け付けない
        }
      }
    }
  }
  //左に動かす
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (col > 0 && cells[row][col].blockNum === fallingBlockNum) {
        cells[row][col - 1].className = cells[row][col].className;
        cells[row][col - 1].blockNum = cells[row][col].blockNum;
        cells[row][col].className = '';
        cells[row][col].blockNum = null;
      }
    }
  }
}

function moveRight() {
  /* ブロックを右に移動させる */
  //一番右が壁になっていないか確認
  for (let row = 0; row < 20; row++) {
    if (cells[row][9].blockNum === fallingBlockNum) {
      return; //一番右の行にブロックがいるので右キーを受け付けない
    }
  }
  //一マス右に別のブロックがないか確認
  for (let col = 1; col < 10; col++) {
    for (let row = 0; row < 20; row++) {
      if (cells[row][col].blockNum === fallingBlockNum) {
        if (cells[row][col + 1].className !== '' && cells[row][col + 1].blockNum !== fallingBlockNum) {
          return; //一つ右のマスにブロックがいるので右キーを受け付けない
        }
      }
    }
  }
  //右に動かす
  for (let row = 0; row < 20; row++) {
    for (let col = 9; col >= 0; col--) {
      if (cells[row][col].blockNum === fallingBlockNum) {
        if (cells[row][col + 1].className === '' && col < 9) {
          cells[row][col + 1].className = cells[row][col].className;
          cells[row][col + 1].blockNum = cells[row][col].blockNum;
          cells[row][col].className = '';
          cells[row][col].blockNum = null;
        }
      }
    }
  }
}

// function rotate () {
//   /* ブロックを回転 */
//   let col_new = 0;
//   let row_new = 0;
//   for (let row = 19; row >= 0; row--) {
//     for (let col = 0; col < 10; col++) {
//       if (cells[row][col].blockNum === fallingBlockNum) {
//         col_new = col - row;
//         row_new = row + col;//1 - (row - (blocks[cells[row][col].className].pattern[0].length - 2));
//         cells[row_new][col_new].className = cells[row][col].className;
//         cells[row_new][col_new].blockNum = cells[row][col].blockNum;
//         cells[row][col].className = '';
//         cells[row][col].blockNum = null;
//       }
//     }
//   }
// }

function dropFast () {
  /* 早くブロックを落とす */
  fallBlocks();
}

function onKeyDown(event) {
  /* キー入力によってそれぞれの関数を呼ぶ */
  if (event.keyCode === 37) {
    moveLeft(); //左キー
  } else if (event.keyCode === 39) {
    moveRight(); //右キー
  // } else if (event.keyCode === 38) {
  //   rotate(); //上キー
  } else if (event.keyCode === 40) {
    dropFast(); //下キー
  }
}
