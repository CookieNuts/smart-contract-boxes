const { expect, util } = require('chai');
const { utils } = require('ethers');
const { keccak256, parseEther } = require('ethers/lib/utils');
const { ethers } = require('hardhat');
const { hexToBytes } = require('web3-utils');
const { MerkleTree } = require('merkletreejs')

let DogeDeckNFTV1;
let instance;
let freeMintAddresses = [
    "0x141f9528C041a76FD2F20A9B9B4873Bf7D0AF86E",
    "0xBEAd9FDceF8021850AFB631B8ea005F78C287637",
    "0x29F6B356BB63A886fF92D32eB281B6F5AF63CB93",
    "0x98a0cC669725B70A63B7d894Dd1aaae455DAC5Dd",
    "0xa702182E65305841bAA9A9941e66f816874df3B7",
    "0x5E9d7f2c63F64D75fdCC9eE46b84a760BFFa45d7",
    "0xA033782F9C392F2f67402D6364BBE65FC3ae13cA",
    "0x5b57C997d8A239780fFDad1Ae9eaf3a1AB10aff6",
    "0x5E2a69DE3F3d996C6E8FfD4aE8C015f335483aE2",
    "0x66942E0564fd949115e5c055551aAbdBc36143F2"
];

describe('DogeDeckNFTV1 - benchmark', function () {
    let owner = null;
    let addr1 = null;
    let circuleCount = 100;
    function generateMerkleTree() {
        let leafNodes = freeMintAddresses.map(address => keccak256(address));
        let tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
        return tree;
    }

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        freeMintAddresses[5] = addr1.address;
        tree = generateMerkleTree();
        // console.log('Tree: ', tree.toString());
        let hexRoot = tree.getHexRoot();
        // console.log("Tree RootHex:", hexRoot);
        let hexBytes32;
        // 如果MerkleTree为空，用0地址值初始化Bytes32参数
        if ('0x' == hexRoot) {
            hexBytes32 = hexToBytes(address(0));
        } else {
            hexBytes32 = hexToBytes(hexRoot);
        }
        // console.log("Tree Root hexBytes32:", hexBytes32);
        DogeDeckNFTV1 = await ethers.getContractFactory("DogeDeckNFTV1");
        instance = await DogeDeckNFTV1.deploy("http://127.0.0.1/", hexBytes32, parseEther("0.001"), 1000);
        await instance.deployed();
        await instance.setPublicSaleConf(Date.parse(new Date()) / 1000, 10);
    });

    // // Air drop one
    // it('air drop 1', async function () {
    //     let airDropAmount = 1;
    //     for (let index = 0; index < circuleCount; index++) {
    //         instance.airDrop('0x141f9528C041a76FD2F20A9B9B4873Bf7D0AF86E', airDropAmount);
    //     }
    //     expect((await instance.balanceOf('0x141f9528C041a76FD2F20A9B9B4873Bf7D0AF86E'))).to.equal(airDropAmount * circuleCount);
    // });

    // // Air drop ten
    // it('air drop 10', async function () {
    //     let airDropAmount = 10;
    //     for (let index = 0; index < circuleCount; index++) {
    //         instance.airDrop('0x141f9528C041a76FD2F20A9B9B4873Bf7D0AF86E', airDropAmount);
    //     }
    //     expect((await instance.balanceOf('0x141f9528C041a76FD2F20A9B9B4873Bf7D0AF86E'))).to.equal(airDropAmount * circuleCount);
    // });

    // Air drop list one 
    it('air drop list 1', async function () {
        let amountList = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        for (let index = 0; index < circuleCount; index++) {
            instance.airDropList(freeMintAddresses, amountList);
        }
        expect((await instance.balanceOf('0x141f9528C041a76FD2F20A9B9B4873Bf7D0AF86E'))).to.equal(circuleCount);
    });
})