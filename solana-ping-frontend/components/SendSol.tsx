import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as Web3 from '@solana/web3.js';
import { FC, useEffect, useState } from 'react';
import styles from '../styles/PingButton.module.css';

const PROGRAM_ID = new Web3.PublicKey('ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa');
const PROGRAM_DATA_PUBLIC_KEY = new Web3.PublicKey('Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod');

export const SendSol: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        if (!connection || !publicKey) {
            return;
        }

        const getBalance = async () => {
            const balance = await connection.getBalance(publicKey);
            setBalance(balance / Web3.LAMPORTS_PER_SOL);
        };

        getBalance();
    }, [connection, publicKey]);

    const onClick = () => {
        if (!connection || !publicKey) {
            alert('Please connect your wallet first lol');
            return;
        }

        const transaction = new Web3.Transaction();

        transaction.add(
            Web3.SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new Web3.PublicKey(toAddress),
                lamports: amount * Web3.LAMPORTS_PER_SOL,
            })
        );

        sendTransaction(transaction, connection).then((sig) => {
            console.log(`Explorer URL: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
        });
    };

    return (
        <div className={styles.buttonContainer}>
            <h1>Send SOL</h1>

            <div>
                <span>Balance: {balance}</span>
            </div>

            <div>
                <span>Amount (in SOL) to send:</span>
            </div>
            <input
                type="number"
                placeholder="Amount"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
            />

            <div>
                <span>Send SOL to::</span>
            </div>
            <input
                type="text"
                placeholder="To Address"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
            />
            <button className={styles.button} onClick={onClick}>
                Send!
            </button>
        </div>
    );
};
