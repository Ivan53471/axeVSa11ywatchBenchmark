const fs = require('fs');

const { AxePuppeteer } = require('@axe-core/puppeteer');
const Puppeteer = require('puppeteer');
const { report } = require('process');


exports.run = async (url, path, transformer) => {
    const browser = await Puppeteer.launch({headless: "new"});
    const testPage = await browser.newPage();
    await testPage.setBypassCSP(true);
    await testPage.goto(url);

    // 记录开始时间
    const startTime = Date.now();
    const reports = await new AxePuppeteer(testPage).withTags("wcag2aa").analyze();
    // 记录结束时间
    const endTime = Date.now();
    // 计算分析时间
    const spendTime = +(parseFloat((endTime - startTime) / 1000).toFixed(3));

    await browser.close();

    fs.writeFileSync(path, JSON.stringify(reports, null, 2), { encoding: 'utf8' });

    return {
        analysisTime: spendTime,
        reports: transformer.transform(reports, { url })
    };
}