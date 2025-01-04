exports.transform = (reports, { url }) => {
    function processReportItem(item) {
        return {
          toolCode: item.id,
          description: item.description,
          nodes: item.nodes.map(n => ({
            htmlCode: n.html,
            pointer: n.target?.[0],
          }))
        };
      }
    const combinedReports = [
      ...(reports.violations || []).map(item => processReportItem(item)),
      ...(reports.incomplete || []).map(item => processReportItem(item))
    ];
    
    return combinedReports;
}