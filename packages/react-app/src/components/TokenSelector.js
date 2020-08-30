import React, { useEffect, useState, useContext } from 'react';
import Web3Context from '../lib/Web3Context';
import { getTokenList } from '../lib/tokenList';
import SelectTokenModal from './SelectTokenModal';

export const TokenSelector = ({ isOpen, onClose, setToken }) => {
    const { network } = useContext(Web3Context);
    const [tokenList, setTokenList] = useState();

    useEffect(() => {
        async function fetchTokenList() {
            try {
                const gotTokenList = await getTokenList(network.value);
                setTokenList(gotTokenList);
            } catch (e) {
                // TODO handle error better
                throw e;
            }
        }
        fetchTokenList();
    }, [network]);

    return (
        <SelectTokenModal
            isOpen={isOpen}
            onClose={onClose}
            tokenList={tokenList}
            setToken={setToken}
        />
    );
};
