// Contract based on https://docs.openzeppelin.com/contracts/3.x/erc721
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract DogeDeckNFTV1 is ERC721, Ownable, Pausable, ReentrancyGuard {
    using Address for address;

    // metadata
    string public baseURI;
    // free mint config
    bytes32 public freeMintMerkleRoot;
    // free mint token of user, user => free mint amount
    mapping(address => uint64) public freeMintMapping;

    // -----packing 2 uint128 fields to 32bytes-----
    uint128 public freeMintPrice;
    uint128 public mintPrice;

    // -----packing 4 uint64 fields to 32bytes-----
    uint64 public constant maxMintAmount = 10000;
    // Token will mint next, start with 1
    uint64 internal currTokenId;
    uint64 public freeMintPerAccountAmount;
    uint64 public freeMintTotalAmount;

    // -----packing 4 uint64 fields to 32bytes-----
    uint64 public publicSaleStartTime;
    uint64 public publicSaleAmount;
    // It will auto calculate when setting publicSaleAmount, publicSaleEndTokenId = currentTokenId + publicSaleAmount - 1;
    uint64 public publicSaleEndTokenId;

    // only use can make transaction
    modifier callerIsUser() {
        require(tx.origin == msg.sender, "not user");
        _;
    }

    constructor(
        string memory baseURI_,
        bytes32 freeMintMerkleRoot_,
        uint64 mintPrice_,
        uint64 freeMintTotalAmount_
    ) ERC721("DogeDeckNFTV1", "DOG") {
        baseURI = baseURI_;
        mintPrice = mintPrice_;
        freeMintMerkleRoot = freeMintMerkleRoot_;
        freeMintTotalAmount = freeMintTotalAmount_;
        freeMintPerAccountAmount = 1;
        currTokenId = 1;
    }

    function mint(uint64 amount, bytes32[] calldata freeMintMerkleProof)
        public
        payable
        callerIsUser
        nonReentrant
    {
        uint64 startTokenId = currTokenId;
        uint64 expEndTokenId = startTokenId + amount;
        require(
            block.timestamp >= publicSaleStartTime,
            "public mint not start"
        );
        require(
            expEndTokenId - 1 <= publicSaleEndTokenId &&
                expEndTokenId - 1 <= maxMintAmount,
            "not enough token"
        );
        uint64 freeMintAmount = freeMintCheck(msg.sender, freeMintMerkleProof);
        if (freeMintAmount > 0) {
            if (amount > freeMintAmount) {
                uint64 publicMintAmount = amount - freeMintAmount;
                uint128 totalMintPrice = freeMintAmount *
                    freeMintPrice +
                    publicMintAmount *
                    mintPrice;
                require(msg.value >= totalMintPrice, "not enough ETH");
                _freeMint(msg.sender, freeMintAmount);
                _publicMint(msg.sender, publicMintAmount);
            } else {
                require(msg.value >= amount * freeMintPrice, "not enough ETH");
                _freeMint(msg.sender, amount);
            }
        } else {
            require(msg.value >= amount * mintPrice, "not enough ETH");
            _publicMint(msg.sender, amount);
        }
        require(expEndTokenId == currTokenId, "mint amount error");
    }

    function freeMintCheck(address user, bytes32[] calldata freeMintMerkleProof)
        public
        view
        returns (uint64)
    {
        uint64 freeMintAmount = freeMintPerAccountAmount -
            freeMintMapping[user];
        if (
            MerkleProof.verify(
                freeMintMerkleProof,
                freeMintMerkleRoot,
                keccak256(abi.encodePacked(user))
            ) && freeMintAmount > 0
        ) {
            return freeMintAmount;
        } else {
            return 0;
        }
    }

    function _freeMint(address user, uint64 amount) private {
        uint64 index = currTokenId;
        currTokenId += amount;
        freeMintMapping[user] += amount;
        for (; index < currTokenId; index++) {
            _mint(user, index);
        }
        emit FreeMint(user, amount, freeMintPrice);
    }

    function _publicMint(address user, uint64 amount) private {
        uint64 index = currTokenId;
        currTokenId += amount;
        for (; index < currTokenId; index++) {
            _mint(user, index);
        }
        emit PublicMint(user, amount, mintPrice);
    }

    function airDrop(address user, uint64 amount) public onlyOwner {
        require(currTokenId + amount - 1 <= maxMintAmount, "not enough token");
        uint64 index = currTokenId;
        currTokenId += amount;
        for (; index < currTokenId; index++) {
            _mint(user, index);
        }
    }

    function airDropList(
        address[] calldata userList,
        uint64[] calldata amountList
    ) public onlyOwner {
        require(userList.length == amountList.length, "invalid");
        for (uint64 i = 0; i < userList.length; i++) {
            airDrop(userList[i], amountList[i]);
        }
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId);
        require(!paused(), "paused");
    }

    function setMintConf(
        string memory baseURI_,
        bytes32 freeMintMerkleRoot_,
        uint64 mintPrice_,
        uint64 freeMintPrice_,
        uint64 freeMintPerAccountAmount_,
        uint64 freeMintTotalAmount_
    ) public onlyOwner {
        baseURI = baseURI_;
        mintPrice = mintPrice_;
        freeMintPrice = freeMintPrice_;
        freeMintMerkleRoot = freeMintMerkleRoot_;
        freeMintPerAccountAmount = freeMintPerAccountAmount_;
        freeMintTotalAmount = freeMintTotalAmount_;
    }

    function setPublicSaleConf(
        uint64 publicSaleStartTime_,
        uint64 publicSaleAmount_
    ) public onlyOwner {
        publicSaleStartTime = publicSaleStartTime_;
        publicSaleAmount = publicSaleAmount_;
        publicSaleEndTokenId = currTokenId + publicSaleAmount - 1;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    event PublicMint(address user, uint64 amount, uint128 price);
    event FreeMint(address user, uint64 amount, uint128 price);
    event Mint(address user, uint64 amount);
}
