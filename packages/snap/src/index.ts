import { OnRpcRequestHandler } from '@metamask/snap-types';
import { OnCronjobHandler } from '@metamask/snaps-types';
// import { panel, text, heading } from '@metamask/snaps-ui';
import fetch from "node-fetch";

import { useState, useEffect, } from 'react';

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


export const onCronjob: OnCronjobHandler = async ({ request }) => {
  let rand = Math.floor(Math.random()* 10)
  console.log(rand);
  let respData: Array<QueryData> = [];
  respData = await fetchData();
  switch (request.method) {
    case 'fireCronjob':
      return wallet.request({
        method: 'snap_notify',
        params: [
          {
            type: 'inApp',
            message: `Hii ${respData[rand].FROM_ADDRESS}`,
          },
        ],
      });
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
