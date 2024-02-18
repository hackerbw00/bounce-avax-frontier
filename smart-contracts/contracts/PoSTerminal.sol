// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./Vault.sol";

contract PoSTerminal is Ownable {
    using Address for address;

    constructor() {}

    function transferAndCall(
        address vaultAddress,
        address tokenAddress,
        uint256 amount,
        bytes memory signature,
        address target,
        bytes memory data
    ) public payable onlyOwner {
        Vault(vaultAddress).transfer(tokenAddress, amount, signature);

        target.functionCallWithValue(data, msg.value);
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function withdrawToken(address _token) public onlyOwner {
        IERC20 token = IERC20(_token);
        token.transfer(owner(), token.balanceOf(address(this)));
    }

    function call(address addr, bytes memory data) public payable onlyOwner {
        addr.functionCallWithValue(data, msg.value);
    }
}
