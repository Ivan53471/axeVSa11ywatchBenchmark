const { group } = require("console");

// exports.transform = (reports, { url }) => {
//   return (reports?.issues || []).map(issue => ({
//       toolCode: issue.code,
//       description: issue.message,
//       nodes: [{
//           htmlCode: issue.context,
//           pointer: issue?.selector
//       }]
//   }));
// }


exports.transform = (reports, { url }) => {
    // 筛选出 error 的部分
    const errorIssues = reports.data.issues.filter(issue => issue.type === 'error');
    const groupedData = errorIssues.reduce((result, issue) => {
        const { code, selector, context, message } = issue;
        if (!result[code]) {
            result[code] = {
              "toolCode":code,
              "description":message,
              nodes: []
            };
          }        
          const node = {
            pointer:selector,
            htmlCode:context
          };
          result[code].nodes.push(node);        
          return result;
        }, {});
    // console.log("hello");
      return Object.values(groupedData);
     
}