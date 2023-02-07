export type QueryResult = {
  blockNumber: number;
  timeStamp: number;
  hash: string;
  nonce: number;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to: string;
  value: bigint | number | any;
  tokenName: string | null;
  tokenSymbol: string | null;
  tokenDecimal: number | null | any;
  gasPrice: null;
  isError: number;
  txreceipt_status: number;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: number;
  gasUsed: number;
  confirmations: number;
  methodId: string;
  functionName: string;
};

/* 
All endpoints url : https://docs.etherscan.io/getting-started/endpoint-urls
*/

export const getApiEndPoint = (accountNo: string, startBlock: number) => {
  // return `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${accountNo}&tag&startblock=${startBlock}&endblock=99999999&page=1&offset=10&sort=desc&apikey=FTEX18HGQZCHFNEQSVXMY5G5Z23JU3DJP2`
  return `https://api-goerli.etherscan.io/api?module=account&action=tokentx&address=${accountNo}&tag&startblock=${startBlock}&endblock=99999999&page=1&offset=100&sort=asc&apikey=FTEX18HGQZCHFNEQSVXMY5G5Z23JU3DJP2`;
};

export const spamCheckMessage = async (
  accountNo: string,
  checkBlock: number,
  contractAddress: string,
) => {
  const spamLimit = 2; // 5 for trials, 50 for final
  const checkRange = 100; // 30 for trials, 3 for final
  const address = `https://api-goerli.etherscan.io/api?module=account&action=tokentx&address=${accountNo}&contractaddress=${contractAddress}&tag&startblock=${
    checkBlock - checkRange
  }&endblock=${
    checkBlock + checkRange
  }&page=1&offset=1000&sort=desc&apikey=FTEX18HGQZCHFNEQSVXMY5G5Z23JU3DJP2`;
  console.log(address);
  const senderData: any = await fetchData(address).then((res) => {
    return res;
  });

  if (senderData.length > spamLimit) {
    return `❗`;
  }
  // if(senderData.length > spamLimit) {return `; Spam! (${senderData.length} txs)`;}
  return `✅`;
};

export const fetchData = async (address: string): Promise<QueryResult[]> => {
  try {
    const response = await fetch(address);
    const data: any = await response.json();
    const { result } = data;
    // console.debug("Printing result of fetch data")
    // console.log("Printing result of fetch data")
    // console.log(`result has length ${result.length}`)
    // console.debug(result)
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
};

/**
 *
 */
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

export type snapState = {
  lastNotifiedBlock: number;
  lastTimestamp: number;
  accounts: string[];
};
