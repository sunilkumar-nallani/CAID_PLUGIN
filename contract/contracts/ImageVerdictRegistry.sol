// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol"; // Import Ownable

contract ImageVerdictRegistry is Ownable {
    // Mapping from image hash (bytes32) to its final verdict (string)
    mapping(bytes32 => string) private verdicts;

    // Event to log when a verdict is recorded
    event VerdictRecorded(bytes32 indexed imageHash, string verdict);

    // Constructor transfers ownership to the deployer (your backend address later)
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Records the final verdict for a given image hash.
     * Can only be called by the owner (your backend).
     * @param _imageHash The unique hash of the image.
     * @param _verdict The final verdict ("real" or "synthetic").
     */

    function recordVerdict(bytes32 _imageHash, string memory _verdict) public onlyOwner {
        // Basic validation for verdict string (optional but good practice)
        require(
            keccak256(abi.encodePacked(_verdict)) == keccak256(abi.encodePacked("real")) ||
            keccak256(abi.encodePacked(_verdict)) == keccak256(abi.encodePacked("synthetic")),
            "Verdict must be 'real' or 'synthetic'"
        );
        verdicts[_imageHash] = _verdict;
        emit VerdictRecorded(_imageHash, _verdict);
    }

    /**
     * @dev Retrieves the recorded verdict for a given image hash.
     * Publicly viewable by anyone.
     * @param _imageHash The unique hash of the image.
     * @return The final verdict string, or an empty string if not recorded.
     */
     
    function getVerdict(bytes32 _imageHash) public view returns (string memory) {
        return verdicts[_imageHash];
    }
}