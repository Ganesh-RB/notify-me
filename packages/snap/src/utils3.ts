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
{
      "blockNumber": "8445766",
      "timeStamp": "1675706172",
      "hash": "0x3ebcda88657560f4c75012ce98a3d8e700e51019e2ef10f8d2ab95ccf7a9beb2",
      "nonce": "3",
      "blockHash": "0x78ce72a07365db8ce107726be7a910ada23aa64c4601e767c236e9eedb7c4fd8",
      "from": "0xc47fe1bae1b40951f811a6e26011d0b748b81414",
      "contractAddress": "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
      "to": "0x0d379a18bad866292cc7aa01d69bba8c7c282a00",
      "value": "1000000000000000",
      "tokenName": "Wrapped Ether",
      "tokenSymbol": "WETH",
      "tokenDecimal": "18",
      "transactionIndex": "32",
      "gas": "77620",
      "gasPrice": "1500378959",
      "gasUsed": "51747",
      "cumulativeGasUsed": "5697063",
      "input": "deprecated",
      "confirmations": "2985"
    }, */

/* 
All endpoints url : https://docs.etherscan.io/getting-started/endpoint-urls
*/

export const getApiEndPoint = (accountNo: string, startBlock: number) => {
  return `https://api-goerli.etherscan.io/api?module=account&action=tokentx&address=${accountNo}&tag&startblock=${startBlock}&endblock=99999999&page=1&offset=10&sort=desc&apikey=FTEX18HGQZCHFNEQSVXMY5G5Z23JU3DJP2`;
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
