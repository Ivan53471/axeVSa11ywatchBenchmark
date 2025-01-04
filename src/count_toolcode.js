const fs = require('fs');
const path = require('path');

function countToolCodes(jsonData) {
    const toolCodeCounts = {};
    const nodeCounts = {};

    for (const site in jsonData) {
        if (jsonData.hasOwnProperty(site)) {
            const tools = jsonData[site];
            for (const tool in tools) {
                if (tools.hasOwnProperty(tool) && tool !== 'analysisTime') {
                    // Initialize the tool entry if it doesn't exist
                    if (!toolCodeCounts[tool]) {
                        toolCodeCounts[tool] = new Set();
                        nodeCounts[tool] = {};
                    }

                    // Collect all unique toolCodes and their nodes for the current tool
                    tools[tool].reports.forEach(report => {
                        const toolCode = report.toolCode;
                        toolCodeCounts[tool].add(toolCode);

                        // Initialize the toolCode entry if it doesn't exist
                        if (!nodeCounts[tool][toolCode]) {
                            nodeCounts[tool][toolCode] = 0;
                        }

                        // Add the number of nodes found for this toolCode
                        nodeCounts[tool][toolCode] += report.nodes.length;
                    });
                }
            }
        }
    }

    // Convert Sets to counts and combine with node counts
    const result = {};
    for (const tool in toolCodeCounts) {
        result[tool] = {
            toolCodeCount: toolCodeCounts[tool].size,
            toolCodes: {}
        };

        for (const toolCode in nodeCounts[tool]) {
            result[tool].toolCodes[toolCode] = nodeCounts[tool][toolCode];
        }
    }

    return result;
}


const filePath = path.join(__dirname, '../results.json');
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading file from disk:", err);
        return;
    }

    try {
        // 解析 JSON 字符串为对象
        const jsonData = JSON.parse(data);

        // 调用函数并打印结果
        const result = countToolCodes(jsonData);
        console.log(result);
    } catch (err) {
        console.error("Error parsing JSON string:", err);
    }
});