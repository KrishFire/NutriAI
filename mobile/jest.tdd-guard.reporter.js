const fs = require('fs');
const path = require('path');

class TddGuardReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts, results) {
    const historyDir = path.join(process.cwd(), '.tdd-guard-history');
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    const report = {
      status: results.numFailedTests > 0 ? 'failed' : 'passed',
      numFailedTests: results.numFailedTests,
      numPassedTests: results.numPassedTests,
      numTotalTests: results.numTotalTests,
      startTime: results.startTime,
      // We can add more details from the results object if needed
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(historyDir, `${timestamp}.json`);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    if (report.status === 'failed') {
      console.log(
        `\n🔴 TDD Guard: ${results.numFailedTests} test(s) failed. Commit will be blocked.`
      );
    } else {
      console.log('\n🟢 TDD Guard: All tests passed. You are clear to commit.');
    }
  }
}

module.exports = TddGuardReporter;
