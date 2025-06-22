import React, { useState } from 'react'
import CryptoJS from 'crypto-js'

export const Crypto = () => {
    const [text, setText] = useState("")  // setText("hi") // text = hi
    const [encrypted, setEncrypted] = useState("")  // encrypted = encrypted
    const [seKey, setSeKey] = useState("");

    const secretKey = () => {
        const key = CryptoJS.enc.Utf8.parse(text);
        console.log(key);
        setSeKey(key);
    }

    const encrypt = () => {
        secretKey()
        const encrypted = CryptoJS.AES.encrypt(text, seKey).toString();
        setEncrypted(encrypted)
    }
    
    const print = () => {
        console.log(text);
    }
    
    return (
        <>
            <input
                type="text"
                placeholder="Enter your text"
                value={text}
                onChange={ (e) => {
                    setText(e.target.value)
                } }
            />
            <button onClick={print} >print</button>
            <button onClick={encrypt} >Encrypt</button>
            <h2>Encrypted: {encrypted} </h2>
        </>
    )
}
