// const a11yWatch = require("@a11ywatch/a11ywatch");

// exports.run = async (url, html, transformer) => {
//   const data = (await a11yWatch.scan({ url: url })).data
//     return transformer.transform(data, { url })
// }

const child_process = require('child_process');
var iconv = require('iconv-lite');
// var binaryEncoding = 'binary';
const chineseMark = '一'
var binaryEncoding = 'buffer';
const fs = require('fs');
const { report } = require('process');

exports.run = async (url, path, transformer) => {
  return new Promise((resolve, reject) => {

    const command = `a11ywatch scan --url ${url}`;

    child_process.execSync('chcp 65001')

    // 记录开始时间
    const startTime = Date.now();

    child_process.exec(command, { encoding: binaryEncoding }, (error, stdout, stderr) => {

      if (error) {
        // console.error(`Error executing a11ywatch: `, iconv.decode(Buffer.from(stderr, binaryEncoding), encoding));
        return reject(error);
      }

      try {
        // // 解析 a11ywatch 输出的 JSON 数据
        // console.log(iconv.decode(Buffer.from(stdout, binaryEncoding), encoding));
        // const data = JSON.parse(iconv.decode(Buffer.from(stdout, binaryEncoding), encoding));
        // // console.log(data)
        if (Buffer.isBuffer(stdout)) {
          let charset = ['cp936', 'utf8'].find((charset) => {
            return ~iconv.decode(stdout, charset).indexOf(chineseMark)
          })
          if (charset) {
            [stdout, stderr] = [stdout, stderr].map(v => iconv.decode(v, charset))
            // console.log(stdout)
            // stdout = stdout.replace(chineseMark, '') // 移除标记
          } else {
            [stdout, stderr] = [stdout, stderr].map(v => v.toString('utf8'))
            // console.log(stdout)
          }
        }
        
        data = JSON.parse(stdout);

        // 记录结束时间
        const endTime = Date.now();
        // 计算分析时间
        const spendTime = +(parseFloat((endTime - startTime) / 1000).toFixed(3));
        fs.writeFileSync(path, JSON.stringify(data, null, 2), { encoding: 'utf8' });

        // 使用 transformer 处理数据并返回结果
        resolve({
          analysisTime: spendTime,
          reports: transformer.transform(data, { url })
        });
      } catch (parseError) {
        console.error(`Failed to parse a11ywatch output: ${parseError.message}`);
        reject(parseError);
      }
    });
  });
};