'use strict';
const fs = require('fs');
const readline = require('readline');
const rs = fs.createReadStream('./popu_source.csv');
const rl = readline.createInterface({ input: rs, output: {} });
let data = new Map();//集計用
let agekey = null;//集計用、年代
rl.on('line', lineString => {
  //必要なデータを取ってくる
  const columns = lineString.replace(/\"/g, '').split(',');
  if (columns[0] !== `001`) return;
  if (columns[2] !== `001`) return;
  if (columns[5] === `総数`) return;
  const year = parseInt(columns[5].replace(/歳/g, '').replace(/以上/g, ''));
  const popu = parseInt(columns[11]);
  //年代ごとに集計
  if (year % 10 === 0) {
    agekey = `${year}代`;
    data.set(agekey, popu);
  } else {
    data.set(agekey, data.get(agekey) + popu);
  }
});

rl.on('close', () => {
  //大きい順に並べなおす
  const dataary = Array.from(data);
  dataary.sort((a, b)=> (a[1] < b[1] ? 1 : -1));
  //整形
  const rankingary = dataary.map((e,i,ary)=>{
    if(e[0] === `0代`){
      return `${i + 1}位: 10歳未満 ${e[1]}\n`;
    }
    if(e[0] === `100代`){
      return `${i + 1}位: 100歳以上 ${e[1]}\n`;
    }
    return `${i + 1}位: ${e[0]} ${e[1]}\n`;
  })
  //ファイルに出力
  const fileName = './test.txt';
  const outputtext = rankingary.join(``);
  fs.appendFileSync(fileName, `2019年10月1日現在の年代別総人口ランキング [千人]\n`, 'utf8');
  fs.appendFileSync(fileName, outputtext, 'utf8');
});