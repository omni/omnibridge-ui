import React, { useContext, useState, useEffect } from "react";
import Web3Context from "../lib/Web3Context";

export const Header = () => {
    const { ethersProvider, connectWeb3 } = useContext(Web3Context);

    const [account, setAccount] = useState();
    useEffect(() => {
        async function getAccount() {
            try {
                const signer = await ethersProvider.getSigner();
                const gotAccount = await signer.getAddress();
                setAccount(gotAccount);
            } catch (error) {
                console.log({ accountError: error });
            }
        }
        getAccount();
    }, [ethersProvider]);

    return (
        <div className="header">
            <button onClick={connectWeb3}>Connect</button>
            {account && <p> Connected as {account} </p>}
        </div>
    );
};
