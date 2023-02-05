import {OnRpcRequestHandler, OnCronjobHandler } from '@metamask/snaps-types';
import {ethers} from 'ethers';
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


const apiEndPoint = "https://api.flipsidecrypto.com/api/v2/queries/217e4e14-551a-492a-a4af-3c68a1e0afaf/data/latest";

const fetchData = async () : Promise<Array<QueryData>>=> {
  try {
      const response = await fetch(apiEndPoint);
      const data: Array<QueryData> = await response.json();
      return data
  } catch (err) {
      console.error(err);
      return err;
  }
};

export const getEoaAddress = async (): Promise<string> => {
  const provider = new ethers.providers.Web3Provider(wallet as any);
  const accounts = await provider.send('eth_requestAccounts', []);
  return accounts[0];
};


//get the lastTimestamp 
// First you get the data from the query and store it in the respData variable.
// Then you update the lastTimestamp
//Then you check if the there are any new transactions.
//If there are no transactions then don't do anything.
//If there are transactions then send notifications using a for loop.





export const onCronjob: OnCronjobHandler = async ({ request }) => {
  
  const address = await getEoaAddress();
  console.log(address)
  const query = `SELECT * FROM flipside_prod_db.tokenflow_eth.transactions as transactions where transactions.to_address = ${address} limit 10 where timestamp > prev_timestamp;`
  
  const persistedData =await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  const  query1 = `  select *  from goerli.transactions 
 where to = "userAddress" and block_number  > "last_notifiedBlock//some other logic";`

 //you will query and store the data you get.
  let respData: Array<QueryData> = [];
  respData = await fetchData();
  let rand = Math.round(Math.random() * 8)

  //then you update the state to the last block you will be getting.
  await wallet.request({
    method: 'snap_manageState',
    params: ['update', { timestamp: `${respData[rand]['FROM_ADDRESS']}`}],
  });
  
  

  
  console.log(persistedData);
  // { hello: 'world' }
 
  switch (request.method) {
    case 'fireCronjob':
      //you will run a for loop on the data you get
      if(respData[3]["FROM_ADDRESS"] ==respData[rand]["FROM_ADDRESS"])
      {

        return wallet.request({
          method: 'snap_notify',
          params: [
            {
              type: 'inApp',
              message: `Hii ${respData[rand]["FROM_ADDRESS"]}}`
            },
          ],
        });
      }
      else {
        console.log('it isnt 3')
      }
    
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

  let respData: Array<QueryData> = [];
  respData = await fetchData();
  
  switch (request.method) {
    case 'hello':
      return wallet.request({
        method: 'snap_notify',
        params: [
          {
            type: 'inApp',
            message: `Hii ${respData[0].TIMESTAMP}`,
          },
        ],
      });
    default:
      throw new Error('Method not found.');
  }
};
