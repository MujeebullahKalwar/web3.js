/*
This file is part of web3.js.

web3.js is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

web3.js is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
import { isHexStrict } from 'web3-validator';
import { toChecksumAddress } from 'web3-utils';
import { EthPersonal } from '../../src/index';
import { accounts, clientUrl } from '../config/personal.test.config';
import { getSystemTestBackend, getSystemTestAccounts } from '../fixtures/system_test_utils';

describe('set up account', () => {
	let ethPersonal: EthPersonal;
	let account: string[];
	beforeAll(async () => {
		ethPersonal = new EthPersonal(clientUrl);
		account = await getSystemTestAccounts();
	});
	it('new account', async () => {
		const newAccount = await ethPersonal.newAccount('!@superpassword');
		expect(isHexStrict(newAccount)).toBe(true);
	});

	it('sign', async () => {
		if (getSystemTestBackend() === 'geth') {
			const rawKey = accounts[2].privateKey.slice(2);
			const key = await ethPersonal.importRawKey(rawKey, 'password123');
			// ganache does not support sign
			const signature = await ethPersonal.sign('0xdeadbeaf', key, '');
			// eslint-disable-next-line jest/no-conditional-expect
			expect(signature).toBe(
				'0xac6121223605547bfdf74541f98b4c745a93fc214a6a7bfc5f9162b26c63ebe373394444f0986745c64ef77d58363a39640e12101bb85e2dd6c764a69457b6f51c',
			);
		}
	});

	it('ecRecover', async () => {
		if (getSystemTestBackend() === 'geth') {
			// ganache does not support ecRecover
			const signature = await ethPersonal.sign('0x2313', account[0], '');
			const publicKey = await ethPersonal.ecRecover('0x2313', signature); // ecRecover is returning all lowercase
			// eslint-disable-next-line jest/no-conditional-expect
			expect(toChecksumAddress(publicKey)).toBe(toChecksumAddress(account[0]));
		}
	});

	it('lock account', async () => {
		// ganache requires prefixed, must be apart of account ganache command
		const lockAccount = await ethPersonal.lockAccount(account[0]);
		expect(lockAccount).toBe(true);
	});

	it('unlock account', async () => {
		const key = account[0];
		const unlockedAccount = await ethPersonal.unlockAccount(key, '', 10000);
		expect(unlockedAccount).toBe(true);
	});

	it('getAccounts', async () => {
		const accountList = await ethPersonal.getAccounts();
		const accountsLength = accountList.length;
		// create a new account
		await ethPersonal.newAccount('cde');
		const updatedAccountList = await ethPersonal.getAccounts();
		expect(updatedAccountList).toHaveLength(accountsLength + 1);
	});

	it('importRawKey', async () => {
		const rawKey =
			getSystemTestBackend() === 'geth'
				? accounts[4].privateKey.slice(2)
				: accounts[4].privateKey;
		const key = await ethPersonal.importRawKey(rawKey, 'password123');
		expect(toChecksumAddress(key)).toBe(accounts[4].address);
	});

	it('signTransaction', async () => {
		const rawKey =
			getSystemTestBackend() === 'geth'
				? accounts[3].privateKey.slice(2)
				: accounts[3].privateKey;
		const key = await ethPersonal.importRawKey(rawKey, 'password123');
		const from = key;
		const to = '0x1337C75FdF978ABABaACC038A1dCd580FeC28ab2';
		const value = `10000`;
		const tx = {
			from,
			to,
			value,
			gas: '21000',
			maxFeePerGas: '0x59682F00',
			maxPriorityFeePerGas: '0x1DCD6500',
			nonce: 0,
		};
		const signedTx = await ethPersonal.signTransaction(tx, '');

		const expectedResult =
			'0x02f86e82053980841dcd65008459682f00825208946e599da0bff7a6598ac1224e4985430bf16458a482271080c080a080dfd8ea310fd2b56f46de72d02c540b7076ea3d8f9b946dc83a7785301bc027a0696332df244fabec85a6e777f565c2f69ba0d4d607ced23ac03a0b503fae4659';
		expect(signedTx).toEqual(expectedResult);
	});

	it('sendTransaction', async () => {
		const to = accounts[2].address;
		const value = `10000`;

		const from = account[0];
		const tx = {
			from,
			to,
			value,
			gas: '21000',
			maxFeePerGas: '0x59682F00',
			maxPriorityFeePerGas: '0x1DCD6500',
		};
		const receipt = await ethPersonal.sendTransaction(tx, '');
		const expectedResult =
			getSystemTestBackend() === 'geth'
				? '0xbae20bf334cdb8779056db78ab9130e4587a47937d5abfd36b1ff70e8e22c6a8'
				: '0xce8c0649b6d8bc6fa933cd7b610c6435436d85b51095bf47d35dd52b7f0c5b0b';
		expect(JSON.parse(JSON.stringify(receipt))).toEqual(
			JSON.parse(JSON.stringify(expectedResult)),
		);
		expect(isHexStrict(receipt)).toBe(true);
	});
});