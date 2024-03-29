import { OnRpcRequestHandler, OnCronjobHandler } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';
import fetch from 'node-fetch';
import {
  QueryResult,
  snapState,
  getAccount,
  getApiEndPoint,
  fetchData,
  spamCheckMessage,
  getLastTransaction,
} from './utils';

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  console.log('cronjob invoked');

  const persistedData: snapState | any = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });

  let address = '';
  let lastTimestamp = 0;
  let accounts: string[] = [];

  if (persistedData !== null) {
    accounts = persistedData.accounts;
    console.log(accounts[0]);
    address = getApiEndPoint(accounts[0], persistedData.lastNotifiedBlock);
    console.log(address);
    lastTimestamp = persistedData.lastTimestamp;

    const data = await fetchData(address).then((res) => {
      return res;
    });

    console.log('Printing data');
    console.log(data);

    switch (request.method) {
      case 'fireCronjob':
        try {
          let i = 0;
          // console.log(`Data length is ${data.length}`)
          while (i < data.length) {
            // console.log(`printing data for ${i}`)
            // console.log(data[i])

            if (
              data[i].to === accounts[0] &&
              data[i].timeStamp > lastTimestamp
            ) {
              // console.log("Sending notification")
              await wallet.request({
                method: 'snap_manageState',
                params: [
                  'update',
                  {
                    lastNotifiedBlock: `${data[i].blockNumber}`,
                    lastTimestamp: `${data[i].timeStamp}`,
                    accounts,
                  },
                ],
              });
              // console.log(`received ${data[i].value} ETH from ${data[i].from}`)
              // console.log(`received ${data[i].value} ETH from ${data[i].from}`.length)

              const notificationFromField = `${data[i].from.substring(
                0,
                4,
              )}...${data[i].from.substring(
                data[i].from.length - 4,
                data[i].from.length,
              )}`;

              const notificationValueField = `${
                data[i].value / Math.pow(10, data[i].tokenDecimal)
              }`;
              const notificationTokenType =
                data[i].tokenSymbol === null ? 'ETH' : data[i].tokenSymbol;

              const msg = await spamCheckMessage(
                data[i].from,
                data[i].blockNumber,
                data[i].contractAddress,
              );
              return wallet.request({
                method: 'snap_notify',
                params: [
                  {
                    type: 'inApp',
                    message: `${msg} Received ${notificationValueField} ${notificationTokenType} from ${notificationFromField}`,
                  },
                ],
              });
            }
            // console.log(`Notification was send previously for ${i}`)
            i++;
          }
          break;
        } catch (err) {
          console.log(err);
        }

      default:
        throw new Error('Method not found.');
    }
  }
};

/**
 *
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
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'hello':
      console.log('hello invoked');
      return wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: getMessage(origin),
            description:
              'This custom confirmation is just for display purposes.',
            textAreaContent: `You can edit it`,
          },
        ],
      });

    case 'optIn':
      console.log('optIn invoked');
      const account = await getAccount().then((res) => {
        console.log('Printing accounts details');
        console.log(res);
        return res;
      });

      const persistedData: snapState | any = await wallet.request({
        method: 'snap_manageState',
        params: ['get'],
      });

      if (persistedData === null) {

        const lastTransaction = await getLastTransaction(account[0]).then(
          (res) => {
            return res;
          },
        );

        try {

          await wallet.request({
            method: 'snap_manageState',
            params: [
              'update',
              {
                lastNotifiedBlock: `${lastTransaction.blockNumber}`,
                lastTimestamp: `${lastTransaction.timeStamp}`,
                accounts: account,
              },
            ],
          });

        } catch (err) {
          console.log(err);

          await wallet.request({
            method: 'snap_manageState',
            params: [
              'update',
              {
                lastNotifiedBlock: `0`,
                lastTimestamp: `0`,
                accounts: account,
              },
            ],
          });
        }
        
      } else {
        await wallet.request({
          method: 'snap_manageState',
          params: [
            'update',
            {
              lastNotifiedBlock: `${persistedData.lastNotifiedBlock}`,
              lastTimestamp: `${persistedData.lastTimestamp}`,
              accounts: account,
            },
          ],
        });
      }

      return wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: getMessage(origin),
            description: 'Notice: From NotifyMe',
            textAreaContent: `You Opted in to receive notifications for your account ${account[0]}`,
          },
        ],
      });

    case 'optOut':
      console.log('optOut invoked');
      
      await wallet.request({
        method: 'snap_manageState',
        params: [
          'clear',
        ],
      });


      return wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: getMessage(origin),
            description: 'Notice: From NotifyMe',
            textAreaContent: `You Opted Out for receive notifications for your account `,
          },
        ],
      });

    default:
      throw new Error('Method not found.');
  }
};
