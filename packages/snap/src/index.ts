import { OnRpcRequestHandler, OnCronjobHandler } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';
import fetch from "node-fetch";
import { QueryResult, snapState, getAccount, getApiEndPoint, fetchData, spamCheckMessage } from './utils';

export const onCronjob: OnCronjobHandler = async ({ request }) => {

  console.log("cronjob invoked")

  const persistedData: snapState|any = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });

  // console.log("Printing persisted data")
  // console.log(persistedData)

  let address = "";
  let lastTimestamp = 0;
  let accounts: Array<string> = [];

  if (persistedData === null) {
    console.log("Persisted data is null!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
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
    return res;
  });



  switch (request.method) {
    case 'fireCronjob':

      let i = data.length - 1;
      // console.log(`Data length is ${data.length}`)
      while (i >= 0) {


        // console.log(`printing data for ${i}`)
        // console.log(data[i])

        if ( data[i].to === accounts[0] && data[i].timeStamp > lastTimestamp) {
          // console.log("Sending notification")
          await wallet.request({
            method: 'snap_manageState',
            params: ['update', { lastNotifiedBlock: `${data[i].blockNumber}`, lastTimestamp: `${data[i].timeStamp}`, accounts: accounts }],
          });
          // console.log(`received ${data[i].value} ETH from ${data[i].from}`)
          // console.log(`received ${data[i].value} ETH from ${data[i].from}`.length)

          const notificationFromField = `${data[i].from.substring(0, 4)}...${data[i].from.substring(data[i].from.length - 4, data[i].from.length)}`;

          // const senderData = await fetchData( getSpamCheckApi(data[i].from, data[i].blockNumber, checkingRange) ).then((res) => {
          //   return res;
          // });

          let msg = await spamCheckMessage(data[i].from, data[i].blockNumber, data[i].contractAddress);
          
          return wallet.request({
            method: 'snap_notify',
            params: [
              {
                type: 'inApp',
                message: `Got ${data[i].tokenSymbol} from ${notificationFromField} ${msg}`,
              },
            ],
          });
        }
        // console.log(`Notification was send previously for ${i}`)
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
  
  // * Note: We are clearning snap_state for test purpose only.
  // await wallet.request({
  //   method: 'snap_manageState',
  //   params: ['clear'],
  // })

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

    default:
      throw new Error('Method not found.');
  }
};