import { Editor } from "@monaco-editor/react";
import { useState, useEffect } from "react";

export default function CodeEditor() {
    const [code, setCode] = useState("");
    const [result, setResult] = useState("");
    const [domOutput, setDomOutput] = useState(null);

    useEffect(() => {
        loadCode();
    }, []);

    const onRunCode = () => {
        try {
            
            const sandbox = document.createElement('div');
            sandbox.id = 'code-sandbox';
            
            
            const originalConsole = { ...console };
            let output = [];
            
            console.log = (...args) => {
                output.push(args.join(' '));
                originalConsole.log(...args);
            };

            const originalCreateElement = document.createElement;
            document.createElement = (tagName) => {
                const element = originalCreateElement.call(document, tagName);
                sandbox.appendChild(element);
                return element;
            };

            const evalResult = eval(code);
            
            
            console.log = originalConsole.log;
            document.createElement = originalCreateElement;
            
            
            setResult([...output, evalResult].join('\n'));
            setDomOutput(sandbox.innerHTML);

        } catch (error) {
            setResult(`Error: ${error.message}`);
            setDomOutput(null);
            console.error("Error running code:", error);
        }
    };

    const onSaveCode = () => {
        try {
            localStorage.setItem("savedCode", code);
            console.log("Code saved successfully!");
        } catch (error) {
            console.error("Error saving code:", error);
        }
    };

    const loadCode = () => {
        try {
            const savedCode = localStorage.getItem("savedCode");
            if (savedCode) {
                setCode(savedCode);
            }
        } catch (error) {
            console.error("Error loading code:", error);
        }
    };

    return (
        <div style={{ padding: "20px"}}>
            <div style={{ marginBottom: "10px" }}>
                <button 
                    onClick={onRunCode}
                    style={{ marginRight: "10px" }}
                >
                    Run
                </button>
                <button 
                    onClick={onSaveCode}
                    style={{ marginRight: "10px" }}
                >
                    Save
                </button>
                <button onClick={loadCode}>
                    Load
                </button>
            </div>
            <div style={{ display: 'flex', gap: '20px', height: '90vh' }}>
                <Editor
                    height="100%"
                    width="60%"
                    defaultLanguage="javascript"
                    defaultValue="//I can only handle console operations for now."
                    theme="vs-dark"
                    value={code}
                    onChange={setCode}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 16,
                    }}
                />
                <div 
                    style={{
                        width: '40%',
                        backgroundColor: '#1e1e1e',
                        color: '#fff',
                        padding: '10px',
                        fontFamily: 'monospace',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap'
                    }}
                >
                    <h3>Console Output:</h3>
                    {result}
                    {domOutput && (
                        <>
                            <h3>DOM Output:</h3>
                            <div 
                                dangerouslySetInnerHTML={{ __html: domOutput }}
                                style={{
                                    border: '1px solid #444',
                                    padding: '10px',
                                    marginTop: '10px'
                                }}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
