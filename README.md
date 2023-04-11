# Solana

Devnet accounts for testing:

Using in testing:
PRIVATE_KEY=[11,11,10,78,255,199,218,254,111,155,34,53,68,9,136,40,140,252,50,236,166,108,83,41,8,105,138,205,30,203,64,49,226,23,244,16,194,9,93,119,41,162,192,0,225,168,116,150,53,141,55,119,6,213,166,83,201,49,108,213,62,109,101,230]
PUBLIC_KEY=GDaKoZTQxaaci1Rwduyv1tYivh8Xb2VXMCS4TvkLovqK

2nd account to use:
PRIVATE_KEY=[88,206,182,11,187,146,158,145,52,42,36,57,239,223,214,25,149,127,92,20,15,88,159,25,90,247,132,43,6,69,14,37,66,69,180,48,145,140,125,73,79,37,234,190,40,194,184,49,91,118,231,241,109,108,200,45,218,90,195,240,230,10,252,64]
PUBLIC_KEY=5ThZAMY4RFdKXEBumQWoA7R42aaJrW2XswzzeS6B76Ej

To get secret key for importing into a wallet use:

```JavaScript
    const secretKey = signer.secretKey;
    const secretKeyHex = Buffer.from(secretKey).toString('hex');
    console.log('Secret key (hex):', secretKeyHex);
```

The token mint account address is FpMt5qJ4AvPwNzdGz1c9upvkitM1j3oNsZ7Fp91jXmGp
Token Mint: <https://explorer.solana.com/address/FpMt5qJ4AvPwNzdGz1c9upvkitM1j3oNsZ7Fp91jXmGp?cluster=devnet>
Token Account: <https://explorer.solana.com/address/Go8s8iykMx2A8ypJ1FuUHTuUUHMfPxk2V4xFdWhToJxv?cluster=devnet>

Mint Token Transaction: <https://explorer.solana.com/tx/2vm7SniDhiCWiCoQH1CCtzwgSZFdtm1DpHhFejaXaDJnYCtPy8HSWM3WPUD19W3gq7x9yyd1p4azy9SntUbv9h2T?cluster=devnet>
