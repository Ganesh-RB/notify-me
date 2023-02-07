# NotifyMe
This snap provides the following features:
- notify: It sends a notification when the user receives ERC20 tokens.
- info: It includes the type of token and part of the sender's address.
- spam check: It also detects and warns against possible spam tokens.

## Installation
- The snap requires the installation of [MetaMask Flask](https://metamask.io/flask/).
- Clone the repository [from here](https://github.com/Ganesh-RB/21/tree/new_implemetation/packages/snap/src).
- Setup using:
```shell
yarn install && yarn start
```

## Tools Used
- cronjobs to run code every minute
- snap_notify to send notifications to the user
- snap_manageState to store the timestamp of last notified transaction
- tokentx API provided by etherscan to fetch the list of transactions
