import React from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ code, setCode, language }) => {
  return (
    <Editor
      height="100%"
      language={language}   // dynamically change language
      value={code}
      onChange={setCode}
      theme="vs-dark"
      options={{
        fontSize: 16,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
      }}
    />
  );
};

export default CodeEditor;
