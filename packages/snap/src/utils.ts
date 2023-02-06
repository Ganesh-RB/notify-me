export interface QueryResult {
    blockNumber: number,
    timeStamp: number,
    hash: string,
    nonce: number,
    blockHash: string,
    transactionIndex: number,
    from: string,
    to: string,
    value: string,
    gas: number,
    gasPrice: null,
    isError: number,
    txreceipt_status: number,
    input: string,
    contractAddress: string,
    cumulativeGasUsed: number,
    gasUsed: number,
    confirmations: number,
    methodId: string,
    functionName: string,
}

/* 
All endpoints url : https://docs.etherscan.io/getting-started/endpoint-urls
*/

export const getApiEndPoint = (accountNo: string, startBlock: number) => {

    return `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${accountNo}&tag&startblock=${startBlock}&endblock=99999999&page=1&offset=10&sort=desc&apikey=FTEX18HGQZCHFNEQSVXMY5G5Z23JU3DJP2`
}

export const fetchData = async (address: string): Promise<Array<QueryResult>> => {
    try {
        const response = await fetch(address);
        const data: any = await response.json();
        const result: Array<QueryResult> = data.result;
        // console.debug("Printing result of fetch data")
        // console.log("Printing result of fetch data")
        // console.log(`result has length ${result.length}`)
        // console.debug(result)
        return result;
    }
    catch (err) {
        console.error(err);
        return err;
    }
};

export async function getAccount(): Promise<any | Error> {
    try {
        const accounts: any = await wallet.request({
            method: 'eth_requestAccounts',
        });
        return accounts;

    } catch (error) {
        console.error(error);
        return error;
    }
}

export interface snapState {
    lastNotifiedBlock: number;
    lastTimestamp: number;
    accounts: Array<string>;
}
