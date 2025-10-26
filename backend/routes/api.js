const express = require('express');
const router = express.Router();
const pool = require('../db/db'); // Import the database connection
const { ethers } = require("ethers"); // **NEW:** Import ethers
const { contractAddress, contractABI } = require('../contractConfig'); // **NEW:** Import config

// **NEW:** Set up connection to the local Hardhat node
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
// **NEW:** Use the first Hardhat account to sign transactions (replace if needed)
// IMPORTANT: In a real deployment, manage private keys securely (e.g., environment variables)
const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
// **NEW:** Create an instance of your contract
const imageRegistryContract = new ethers.Contract(contractAddress, contractABI, signer);

// **NEW:** Define your consensus threshold (e.g., difference of 5 votes)
const VOTE_THRESHOLD = 5;

/**
 * Endpoint to receive a tag from the extension and save it to the database.
 */
router.post('/tag', async (req, res) => {
    const { imageHash, vote } = req.body; // imageHash is expected as a hex string from frontend
    const placeholderUserId = 1;

    if (!imageHash || !vote) {
        return res.status(400).json({ message: 'Missing imageHash or vote' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let imageResult = await client.query('SELECT id, real_counter, deepfake_counter, final_verdict FROM images WHERE phash = $1', [imageHash]);
        let imageId;
        let currentVerdict = 'pending';
        let realVotes = 0;
        let fakeVotes = 0;

        if (imageResult.rows.length > 0) {
            imageId = imageResult.rows[0].id;
            realVotes = imageResult.rows[0].real_counter;
            fakeVotes = imageResult.rows[0].deepfake_counter;
            currentVerdict = imageResult.rows[0].final_verdict;
        } else {
            const insertImageQuery = 'INSERT INTO images(phash) VALUES($1) RETURNING id';
            const newImageResult = await client.query(insertImageQuery, [imageHash]);
            imageId = newImageResult.rows[0].id;
        }

        // --- Don't record vote or update counter if verdict is already final ---
        if (currentVerdict === 'pending') {
            const insertVoteQuery = 'INSERT INTO votes(image_id, user_id, verdict) VALUES($1, $2, $3)';
            await client.query(insertVoteQuery, [imageId, placeholderUserId, vote]);

            // Update counters based on the new vote
            if (vote === 'real') {
                realVotes++;
                await client.query('UPDATE images SET real_counter = $1 WHERE id = $2', [realVotes, imageId]);
            } else { // vote === 'synthetic'
                fakeVotes++;
                await client.query('UPDATE images SET deepfake_counter = $1 WHERE id = $2', [fakeVotes, imageId]);
            }

            // **NEW:** Check if consensus threshold is met
            const difference = Math.abs(realVotes - fakeVotes);
            let finalVerdictToRecord = null;

            if (difference >= VOTE_THRESHOLD) {
                finalVerdictToRecord = realVotes > fakeVotes ? 'real' : 'synthetic';

                console.log(`Consensus reached for image ${imageId} (Hash: ${imageHash}). Verdict: ${finalVerdictToRecord}. Difference: ${difference}`);

                // **NEW:** Update the verdict in the database
                await client.query('UPDATE images SET final_verdict = $1 WHERE id = $2', [finalVerdictToRecord, imageId]);

                // **NEW:** Record the verdict on the blockchain
                // try {
                    // Convert hex string pHash to bytes32 for the contract
                    // IMPORTANT: Assumes imageHash is a hex string WITHOUT '0x' prefix and exactly 64 chars long (for 32 bytes)
                    // If your pHash format is different, this conversion needs adjustment.
                   // const imageHashBytes32 = "0x" + imageHash.padStart(64, '0'); // Add '0x' and pad if necessary

                   //  console.log(`Attempting to record verdict on blockchain for ${imageHashBytes32}...`);
                  //  const tx = await imageRegistryContract.recordVerdict(imageHashBytes32, finalVerdictToRecord);
                  //  console.log("Transaction sent:", tx.hash);
                  //  await tx.wait(); // Wait for the transaction to be mined
                    // console.log("Verdict recorded on blockchain successfully!");

               // } catch (contractError) {
                 //   console.error("Error recording verdict on blockchain:", contractError);
                    // Decide if you want to ROLLBACK the DB transaction if blockchain fails
                    // For now, we'll let the DB commit but log the blockchain error.
               // }
            }
        } // End if currentVerdict === 'pending'

        await client.query('COMMIT');
        res.status(201).json({ message: 'Vote successfully processed!' }); // Updated message

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Database Error:", e.stack);
        res.status(500).json({ message: 'Error processing vote' });
    } finally {
        client.release();
    }
});

// **NEW:** Add an endpoint to check verdict (reads from blockchain first)
router.get('/check/:imageHash', async (req, res) => {
    const { imageHash } = req.params; // Get hash from URL parameter

    if (!imageHash) {
        return res.status(400).json({ message: 'Missing imageHash' });
    }

    try {
        // **NEW:** Convert hash to bytes32 to query the contract
        const imageHashBytes32 = "0x" + imageHash.padStart(64, '0');

        console.log(`Checking blockchain for verdict of ${imageHashBytes32}...`);
        const blockchainVerdict = await imageRegistryContract.getVerdict(imageHashBytes32);

        if (blockchainVerdict && blockchainVerdict !== "") {
            // **NEW:** Found a final verdict on the blockchain
            console.log("Verdict found on blockchain:", blockchainVerdict);
            res.json({ verdict: blockchainVerdict, source: 'blockchain' });
        } else {
            // **NEW:** No final verdict on blockchain, check database for temporary status
            console.log("No verdict on blockchain, checking database...");
            const dbResult = await pool.query('SELECT real_counter, deepfake_counter, final_verdict FROM images WHERE phash = $1', [imageHash]);

            if (dbResult.rows.length > 0) {
                const data = dbResult.rows[0];
                res.json({
                    verdict: data.final_verdict, // Should still be 'pending' if not on blockchain yet
                    realVotes: data.real_counter,
                    fakeVotes: data.deepfake_counter,
                    source: 'database'
                });
            } else {
                // Image not even in the database yet
                res.json({ verdict: 'unknown', source: 'none' });
            }
        }
    } catch (error) {
        console.error("Error checking verdict:", error);
        res.status(500).json({ message: 'Error checking image verdict' });
    }
});


module.exports = router;