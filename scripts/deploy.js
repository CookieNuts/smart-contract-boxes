const { hexToBytes } = require('web3-utils');

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

function generateMerkleTreeRootByte() {
    let leafNodes = freeMintAddresses.map(address => keccak256(address));
    let tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    let hexRoot = tree.getHexRoot();
    // console.log("Tree RootHex:", hexRoot);
    let hexBytes32;
    // 如果MerkleTree为空，用64个Bytes的0值初始化Bytes32参数
    if ('0x' == hexRoot) {
        hexBytes32 = hexToBytes(address(0));
    } else {
        hexBytes32 = hexToBytes(hexRoot);
    }
    return hexRoot;
}

async function main() {
    let hexBytes32 = generateMerkleTreeRootByte();
    const DogeDeckNFTV1 = await ethers.getContractFactory("DogeDeckNFTV1");
    const instance = await DogeDeckNFTV1.deploy("http://127.0.0.1/", hexBytes32, parseEther("0.001"), 500);
    console.log("Contract deploy to address: ", instance.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1)
    });