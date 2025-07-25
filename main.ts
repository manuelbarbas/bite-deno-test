import { ethers } from "npm:ethers@6.15.0";
import { BITE } from "npm:@skalenetwork/bite@0.4.1-beta.1";

// MyToken ABI - Feel free to expand it as necessary
const MyTokenABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Configuration
const CONTRACT_ADDRESS = "0x437F581d7C3472a089AAd0D1b53cef5DC72C7d6E";
const RECIPIENT_ADDRESS = "0xcE7E58D645655CB7B573Fa3B161F344e210Dd2c8";
const AMOUNT = "1";
const FAIR_RPC_URL = "https://testnet-v1.skalenodes.com/v1/idealistic-dual-miram";

// HTML template for the frontend
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BITE Mint Token DApp (Deno.js)</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .config {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .config p {
            margin: 5px 0;
        }
        .form-group {
            margin: 20px 0;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
            margin: 10px 0;
        }
        button:hover {
            background-color: #45a049;
        }
        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .status {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            background-color: #f0f0f0;
        }
        .tx-hash {
            margin-top: 10px;
            padding: 15px;
            border-radius: 8px;
            background-color: #e8f5e8;
            word-break: break-all;
        }
        code {
            background-color: #e9ecef;
            padding: 2px 4px;
            border-radius: 4px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>BITE Mint Token DApp (Deno.js)</h1>
        
        <div class="config">
            <h3>Configuration:</h3>
            <p><strong>Contract:</strong> <code>${CONTRACT_ADDRESS}</code></p>
            <p><strong>Recipient:</strong> <code>${RECIPIENT_ADDRESS}</code></p>
            <p><strong>Amount:</strong> <code>${AMOUNT}</code></p>
            <p><strong>Network:</strong> FAIR Testnet</p>
        </div>
        
        <div class="form-group">
            <label for="privateKey">Private Key:</label>
            <input type="text" id="privateKey" placeholder="Enter your private key here...">
        </div>
        
        <button onclick="mintToken()" id="mintButton">Mint ERC-20 Token</button>
        
        <div id="status" style="display: none;" class="status">
            <h4>Status:</h4>
            <p id="statusText"></p>
        </div>
        
        <div id="txHash" style="display: none;" class="tx-hash">
            <h4>Transaction Hash:</h4>
            <p id="txHashText"></p>
        </div>
    </div>

    <script>
        async function mintToken() {
            const privateKey = document.getElementById('privateKey').value;
            const mintButton = document.getElementById('mintButton');
            const statusDiv = document.getElementById('status');
            const statusText = document.getElementById('statusText');
            const txHashDiv = document.getElementById('txHash');
            const txHashText = document.getElementById('txHashText');
            
            if (!privateKey) {
                alert('Please enter your private key');
                return;
            }
            
            mintButton.disabled = true;
            mintButton.textContent = 'Minting...';
            statusDiv.style.display = 'block';
            txHashDiv.style.display = 'none';
            
            try {
                const response = await fetch('/api/mint', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ privateKey })
                });
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\\n').filter(line => line.trim());
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.status) {
                                statusText.textContent = data.status;
                            }
                            
                            if (data.txHash) {
                                txHashText.textContent = data.txHash;
                                txHashDiv.style.display = 'block';
                            }
                            
                            if (data.error) {
                                statusText.textContent = '❌ ' + data.error;
                            }
                        }
                    }
                }
            } catch (error) {
                statusText.textContent = '❌ Error: ' + error.message;
            } finally {
                mintButton.disabled = false;
                mintButton.textContent = 'Mint ERC-20 Token';
            }
        }
    </script>
</body>
</html>
`;

// Mint function for API endpoint
async function performMint(privateKey: string) {
  const events: string[] = [];
  
  const sendEvent = (data: any) => {
    events.push(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent({ status: 'Preparing mint transaction...' });
    
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(FAIR_RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    sendEvent({ status: `Minting with account: ${wallet.address}` });

    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, MyTokenABI, wallet);
    
    // Encode the function data
    const data = contract.interface.encodeFunctionData("mint", [RECIPIENT_ADDRESS, ethers.parseUnits(AMOUNT,18)]);
    
    // Initialize BITE
    const bite = new BITE(FAIR_RPC_URL);
    
    // Create transaction object
    const transaction = {
      to: CONTRACT_ADDRESS,
      data: data,
    };
    
    sendEvent({ status: 'Encrypting transaction with BITE...' });
    
    // Encrypt the transaction using BITE
    const encryptedTx = await bite.encryptTransaction(transaction);
    
    sendEvent({ status: 'Sending encrypted transaction...' });
    
    // Send the encrypted transaction
    const tx = await wallet.sendTransaction({
      ...encryptedTx,
      value: 0,
      gasLimit: 100000,
    });
    
    sendEvent({ 
      status: `Transaction sent! Hash: ${tx.hash}`,
      txHash: tx.hash
    });
    
    sendEvent({ status: 'Waiting for transaction to be mined...' });
    const receipt = await tx.wait();
    
    sendEvent({ 
      status: `✅ Mint successful! Transaction mined in block ${receipt?.blockNumber}`
    });
    
  } catch (error: any) {
    sendEvent({ error: error.message });
  }
  
  return events;
}

// Web server
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  if (url.pathname === '/') {
    return new Response(htmlTemplate, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
  
  if (url.pathname === '/api/mint' && req.method === 'POST') {
    const { privateKey } = await req.json();
    
    if (!privateKey) {
      return new Response(JSON.stringify({ error: 'Private key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const events = await performMint(privateKey);
    
    return new Response(events.join(''), {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
  
  return new Response('Not Found', { status: 404 });
}

// Start the server
if (import.meta.main) {
  console.log('🚀 Starting BITE Deno Web Server...');
  console.log('📋 Server will be available at: http://localhost:8000');
  console.log('');
  
  Deno.serve({ port: 8000 }, handler);
}
