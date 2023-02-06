import { OnRpcRequestHandler, OnCronjobHandler } from '@metamask/snaps-types';
// import { ethers } from 'ethers';
import { panel, text, heading } from '@metamask/snaps-ui';
import fetch from "node-fetch";

// export const getEoaAddress = async (): Promise<string> => {
//   const provider = new ethers.providers.Web3Provider(wallet as any);
//   const accounts = await provider.send('eth_requestAccounts', []);
//   return accounts[0];
// };

interface QueryData {
  LOAD_ID: string;
  BLOCK: number;
  BLOCK_HASH: string;
  CANONICAL: boolean;
  TIMESTAMP: string;
  TX_INDEX: number;
  TX_HASH: string;
  FROM_ADDRESS: string;
  TO_ADDRESS: string;
  TX_VALUE: number;
  GAS_LIMIT: number;
  GAS_PRICE: number;
  GAS_USED: number;
  GAS_REFUND: number;
  CREATED_ADDRESS: any;
  RETURN_VALUE: string;
  EXCEPTION_ERROR: any;
  REVERT_REASON: any;
  STATUS: boolean;
  CHAIN_ID: any;
  MAX_FEE_PER_GAS: any;
  MAX_PRIORITY_FEE_PER_GAS: any;
  TYPE: number;
  CALL_DATA: string;
}

interface QueryResult {
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

let accounts: Array<string> = [];
// const apiEndPoint = "https://api.flipsidecrypto.com/api/v2/queries/217e4e14-551a-492a-a4af-3c68a1e0afaf/data/latest";
// const gorilaApiEndPoint = "https://api-goerli.etherscan.io/api?module=account&action=balance&address=0x0D379A18baD866292Cc7aa01D69bBA8C7c282A00&tag=latest&apikey=FTEX18HGQZCHFNEQSVXMY5G5Z23JU3DJP2"

const otherEndPoint = "https://api-goerli.etherscan.io/api?module=account&action=txlist&address=0x0D379A18baD866292Cc7aa01D69bBA8C7c282A00&tag&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=FTEX18HGQZCHFNEQSVXMY5G5Z23JU3DJP2"

const getApiEndPoint = (accountNo: string, startBlock: number) => {

  return `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${accountNo}&tag&startblock=${startBlock}&endblock=99999999&page=1&offset=10&sort=desc&apikey=FTEX18HGQZCHFNEQSVXMY5G5Z23JU3DJP2`
}

const fetchData = async (address: string): Promise<Array<QueryResult>> => {
  try {
    const response = await fetch(address);
    const data: any = await response.json();
    const result: Array<QueryResult> = data.result;
    console.log("Printing result of fetch data")
    console.log(`result has length ${result.length}`)
    console.log(result)
    return result;
  }
  catch (err) {
    console.error(err);
    return err;
  }
};

async function getAccount(): Promise<any | Error> {
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

// export const getEoaAddress = async (): Promise<string> => {
//   const provider = new ethers.providers.Web3Provider(wallet as any);
//   const accounts = await provider.send('eth_requestAccounts', []);
//   return accounts[0];
// };


//get the lastTimestamp
// First you get the data from the query and store it in the respData variable.
// Then you update the lastTimestamp
//Then you check if the there are any new transactions.
//If there are no transactions then don't do anything.
//If there are transactions then send notifications using a for loop.


interface snapState {
  lastNotifiedBlock: number;
  lastTimestamp: number;
  accounts: Array<string>;
}


export const onCronjob: OnCronjobHandler = async ({ request }) => {

  console.log("cronjob invoked")


  const persistedData: snapState = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });

  console.log("Printing persisted data")
  console.log(persistedData)

  let address = "";
  let lastTimestamp = 0;
  if (persistedData === null ) {

    const account = await getAccount().then((res) => {
      console.log("Printing accounts details")
      console.log(res);
      return res;
    });
    accounts = account;
    console.log(accounts[0]);
    address = getApiEndPoint(accounts[0], 0);
    console.log(address)
  }
  else {
    accounts = persistedData.accounts;
    console.log(accounts[0]);
    address = getApiEndPoint(accounts[0], persistedData.lastNotifiedBlock);
    console.log(address)
    lastTimestamp = persistedData.lastTimestamp;
  }

  const data = await fetchData(address).then((res) => {
    // console.log("data fetched sucessfully")
    // console.log(res);
    return res;
  });

  
  switch (request.method) {
    case 'fireCronjob':

      let i = data.length - 1;
      console.log(`Data length is ${data.length}`)
      while (i >= 0) {
        console.log(`printing data for ${i}`)
        console.log(data[i])

        if (data[i].timeStamp > lastTimestamp) {
          console.log("Sending notification")
          await wallet.request({
            method: 'snap_manageState',
            params: ['update', { lastNotifiedBlock: `${data[i].blockNumber}`, lastTimestamp: `${data[i].timeStamp}`, accounts: accounts }],
          });
          console.log(`received ${data[i].value} ETH from ${data[i].from}`)
          console.log(`received ${data[i].value} ETH from ${data[i].from}`.length)
          
          return wallet.request({
            method: 'snap_notify',
            params: [
              {
                type: 'inApp',
                message: `received ETH from`
              },
            ],
          });
        }
        console.log(`Notification was send previously for ${i}`)
        i--;
      }
      break;

    default:
      throw new Error('Method not found.');
  }
};

/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {

  // const account = await getAccount().then((res) => {
  //   console.log("Printing accounts details")
  //   console.log(res);
  //   return res;
  // });

  await wallet.request({
    method: 'snap_manageState',
    params: ['clear'],
  })

  // console.log("printing data")
  // console.log(data.result[0])


  switch (request.method) {
    case 'hello':
      console.log("hello invoked")
      return wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: getMessage(origin),
            description:
              'This custom confirmation is just for display purposes.',
            textAreaContent:
              `You can edit it`,
          },
        ],
      });

    // case 'fetchAccount':
    //   const account = await getAccount().then((res) => {
    //     console.log("Printing accounts details")
    //     console.log(res);
    //     return res;
    //   });
    //   // accounts = account;
    //   return wallet.request({
    //     method: 'snap_confirm',
    //     params: [
    //       {
    //         prompt: getMessage(origin),
    //         description:
    //           'This is confirmation for verifying account',
    //         textAreaContent:
    //           `account no :${account} \n`,
    //       },
    //     ],
    //   });

    default:
      throw new Error('Method not found.');
  }
};



/* 

Implementation:

[x] Run cron job every minute
2) Get the last timestamp, block number, Account Number from the state
3) Query the database for the transactions that are greater than the last timestamp, block number
4) If there are no transactions then don't do anything
5) If there are transactions then send notifications using a for loop.
6) Update the state with the last timestamp, block number, Account Number



*/