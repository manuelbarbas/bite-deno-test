# BITE Protocol Test - Deno

This project tests the BITE Protocol integration using **Deno** as the secure JavaScript and TypeScript runtime.

## Framework & Language
- **Language**: TypeScript
- **Runtime**: Deno - Modern secure JavaScript and TypeScript runtime
- **BITE Protocol**: Blockchain encryption for FAIR network transactions
- **Ethers.js**: Ethereum library for blockchain interactions

## Features
- ERC-20 token minting with BITE encryption
- Deno's secure runtime environment
- FAIR testnet integration

## Prerequisites
- Deno (latest version)
- Private key for FAIR testnet

## Installation & Setup

### 1. Install Deno
```bash
curl -fsSL https://deno.land/install.sh | sh

```

### 2. Run the Application
```bash
~/.deno/bin/deno task start
```

## Usage
1. Enter your private key when prompted
2. Click "Mint ERC-20 Token" to execute the transaction
3. Transaction will be encrypted using BITE protocol before submission

## Configuration
- **Contract**: `0x437F581d7C3472a089AAd0D1b53cef5DC72C7d6E`
- **Network**: FAIR Testnet (idealistic-dual-miram)
- **Token Amount**: 1 token (18 decimals)
