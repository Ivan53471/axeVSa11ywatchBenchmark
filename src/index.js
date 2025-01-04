const fs = require('fs')
const path = require('path')

const { axe, a11ywatch } = require('../tools');
const config = require('../config')
const logger = require('../logger')

async function getFolders() {
    dirPath = path.join(config.basepath, 'resources');
    try {
        // 获取目录中的所有项目
        const items = fs.readdirSync(dirPath, { withFileTypes: true });

        // 过滤出文件夹
        const folders = items.filter(item => item.isDirectory()).map(item => item.name);

        return folders;
    } catch (err) {
        console.error('Error reading directory:', err);
        throw err;
    }
}

(async () => {
    // 创建两个文件夹，用于存放原始测试报告和数据清洗后的测试报告
    const original_results_path = path.join(__dirname, "../original_results")

    if (!fs.existsSync(original_results_path)) {
        fs.mkdirSync(original_results_path);
        if (!fs.existsSync(path.join(original_results_path, "axe")))
            fs.mkdirSync(path.join(original_results_path, "axe"));
        if (!fs.existsSync(path.join(original_results_path, "a11ywatch")))
            fs.mkdirSync(path.join(original_results_path, "a11ywatch"));
    }

    const folders = await getFolders();
    logger.info('Get folders successful!');

    logger.info('Test Started');
    // 初始化
    let axeTotalTime = 0;
    let axeTotalIssues = 0;
    let a11yTotalTime = 0;
    let a11yTotalIssues = 0;
    const result = {};
    const metric = {"axe": {}, "a11ywatch": {}}
    for (const website of folders) {
        try {
            result[website] = {};
            metric["axe"][website] = {};
            metric["a11ywatch"][website] = {};
            logger.info(`Analyzing ${website}`);
            const url = new URL(website, config.baseurl).href;

            const axe_original_path = path.join(original_results_path, "axe", `${website}.json`);
            const axeResult = await axe.runner.run(url, axe_original_path, axe.transformer);
            result[website]["axe"] = axeResult;

            const a11y_original_path = path.join(original_results_path, "a11ywatch", `${website}.json`);
            const a11yResult = await a11ywatch.runner.run(url, a11y_original_path, a11ywatch.transformer);
            result[website]["a11ywatch"] = a11yResult;

            // 定义一个函数来计算给定报告中的问题数量
            function countIssuesFromReports(reports) {
                return reports.reduce((acc, report) => acc + (report.nodes ? report.nodes.length : 0), 0);
            }

            // 统计时间
            metric["axe"][website]["time"] = axeResult.analysisTime;
            metric["a11ywatch"][website]["time"] = a11yResult.analysisTime;
            axeTotalTime += axeResult.analysisTime;
            a11yTotalTime += a11yResult.analysisTime;
            // 统计问题数量
            metric["axe"][website]["issues_cnt"] = countIssuesFromReports(axeResult.reports);
            metric["a11ywatch"][website]["issues_cnt"] = countIssuesFromReports(a11yResult.reports);
            axeTotalIssues += metric["axe"][website]["issues_cnt"];
            a11yTotalIssues += metric["a11ywatch"][website]["issues_cnt"];

        } catch (e) {
            console.log(`Error happened while running for ${website}`)
            logger.error(`Error happened while running for ${website}: ${e}`);
        }   
    }

    // 计算平均时长和平均问题数
    const cnt = folders.length
    metric["axe"]["average_time"] = cnt > 0 ? (axeTotalTime / cnt).toFixed(3) : '0.000';
    metric["axe"]["average_issues"] = cnt > 0 ? (axeTotalIssues / cnt).toFixed(1) : '0.0';
    metric["a11ywatch"]["average_time"] = cnt > 0 ? (a11yTotalTime / cnt).toFixed(3) : '0.000';
    metric["a11ywatch"]["average_issues"] = cnt > 0 ? (a11yTotalIssues / cnt).toFixed(1) : '0.0';

    fs.writeFileSync(path.join(__dirname, '../results.json'), JSON.stringify(result, null, 2), { encoding: 'utf8' });
    fs.writeFileSync(path.join(__dirname, '../metrics.json'), JSON.stringify(metric, null, 2), { encoding: 'utf8' });

    console.log("Finished!");
    logger.info('Test Finished');
})();