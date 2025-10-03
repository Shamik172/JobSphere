const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

// Helper to execute code for different languages
const runCodeByLanguage = (code, language, input) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    let filename, command;

    switch (language) {
      case "python":
        filename = path.join(__dirname, `temp_${timestamp}.py`);
        fs.writeFileSync(filename, code);
        command = `python "${filename}"`;
        break;

      case "javascript":
        filename = path.join(__dirname, `temp_${timestamp}.js`);
        fs.writeFileSync(filename, code);
        command = `node "${filename}"`;
        break;

      case "cpp":
        filename = path.join(__dirname, `temp_${timestamp}.cpp`);
        const exeFile = path.join(__dirname, `temp_${timestamp}.out`);
        fs.writeFileSync(filename, code);
        command = `g++ "${filename}" -o "${exeFile}" && "${exeFile}"`;
        break;

      case "java":
        filename = path.join(__dirname, `Temp${timestamp}.java`);
        const className = `Temp${timestamp}`;
        code = code.replace(/public\s+class\s+\w+/, `public class ${className}`);
        fs.writeFileSync(filename, code);
        command = `javac "${filename}" && java -cp "${__dirname}" ${className}`;
        break;

      default:
        return reject(`Language ${language} not supported`);
    }

    const child = exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      // Cleanup temp files
      try { fs.unlinkSync(filename); } catch {}
      if (language === "cpp") {
        try { fs.unlinkSync(path.join(__dirname, `temp_${timestamp}.out`)); } catch {}
      }
      if (language === "java") {
        try { fs.unlinkSync(path.join(__dirname, `${className}.class`)); } catch {}
      }

      if (error) return reject(stderr || error.message);
      resolve(stdout);
    });

    child.stdin.write(input);
    child.stdin.end();
  });
};

// Controller
exports.runCode = async (req, res) => {
  const { code, language, input, expectedOutput } = req.body;

  if (!code || !language || !input || !expectedOutput) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const output = await runCodeByLanguage(code, language, input);
    const actualOutput = output.trim();
    const expected = expectedOutput.trim();

    let passed = false;

    // Try JSON parse for arrays/objects
    try {
      const actualJSON = JSON.parse(actualOutput);
      const expectedJSON = JSON.parse(expected);
      passed = JSON.stringify(actualJSON) === JSON.stringify(expectedJSON);
    } catch {
      passed = actualOutput === expected;
    }

    res.json({
      success: true,
      passed,
      output: actualOutput,
    });
  } catch (err) {
    res.json({ success: false, error: err.toString() });
  }
};
