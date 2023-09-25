// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DurianContract {
    struct Durian {
        string country;
        uint32 postCode;
        uint16 farmID;
        uint32 treeID;
        uint8 durianType;
        uint32 durianID;
        string harvestTime;
        string scanTime;
        string firstPlant;
        uint16 workerID;
    }


    struct Review {
        uint8 creaminess; // Rating for creaminess (1 to 5)
        uint8 fragment;   // Rating for fragment (1 to 5)
        uint8 seedSize;   // Rating for size of seed (1 to 5)
        uint8 taste;      // Rating for taste (1 to 5)
        uint8 sweetness;  // Rating for sweetness (1 to 5)
        uint8 bitterness; // Rating for bitterness (1 to 5)
        uint8 texture;    // Rating for texture (1 to 5)
        uint8 aroma;      // Rating for aroma (1 to 5)
        string comment;
    }

    mapping(uint16 => mapping(uint32 => mapping(uint32 => Durian))) private durians;
    mapping(uint16 => mapping(uint32 => Review[])) private reviews;
    uint16[] private farmIDs;
    mapping(uint16 => uint32[]) private treeIDs;
    mapping(uint16 => mapping(uint32 => uint32[])) private durianIDs;

    function addDurian(
        string memory _country,
        uint32 _postCode,
        uint16 _farmID,
        uint32 _treeID,
        uint8 _durianType,
        uint32 _durianID,
        string memory _harvestTime,
        string memory _scanTime,       
        string memory _firstPlant,     
        uint16 _workerID
    ) external {
        durians[_farmID][_treeID][_durianID] = Durian({
            country: _country,
            postCode: _postCode,
            farmID: _farmID,
            treeID: _treeID,
            durianType: _durianType,
            durianID: _durianID,
            harvestTime: _harvestTime,
            scanTime: _scanTime, 
            firstPlant: _firstPlant,
            workerID: _workerID
        });

        if (!containsFarmID(_farmID)) {
            farmIDs.push(_farmID);
        }

        if (!containsTreeID(_farmID, _treeID)) {
            treeIDs[_farmID].push(_treeID);
        }

        if (!containsDurianID(_farmID, _treeID, _durianID)) {
            durianIDs[_farmID][_treeID].push(_durianID);
        }
    }

 function addReview(
        uint16 _farmID,
        uint32 _treeID,
        uint8 _creaminess,
        uint8 _fragment,
        uint8 _seedSize,
        uint8 _taste,
        uint8 _sweetness,
        uint8 _bitterness,
        uint8 _texture,
        uint8 _aroma,
        string memory _comment
    ) external {
        require(
            _creaminess >= 1 && _creaminess <= 5 &&
            _fragment >= 1 && _fragment <= 5 &&
            _seedSize >= 1 && _seedSize <= 5 &&
            _taste >= 1 && _taste <= 5 &&
            _sweetness >= 1 && _sweetness <= 5 &&
            _bitterness >= 1 && _bitterness <= 5 &&
            _texture >= 1 && _texture <= 5 &&
            _aroma >= 1 && _aroma <= 5,
            "Ratings must be between 1 and 5"
        );

        reviews[_farmID][_treeID].push(Review({
            creaminess: _creaminess,
            fragment: _fragment,
            seedSize: _seedSize,
            taste: _taste,
            sweetness: _sweetness,
            bitterness: _bitterness,
            texture: _texture,
            aroma: _aroma,
            comment: _comment
        }));
    }

    function getDurianData(
        uint16 _farmID,
        uint32 _treeID,
        uint32 _durianID
    ) external view returns (Durian memory) {
        return durians[_farmID][_treeID][_durianID];
    }

    function getReviews(
        uint16 _farmID,
        uint32 _treeID
    ) external view returns (Review[] memory) {
        return reviews[_farmID][_treeID];
    }

    function getFarmIDs() external view returns (uint16[] memory) {
        return farmIDs;
    }

    function getTreeIDs(uint16 _farmID) external view returns (uint32[] memory) {
        return treeIDs[_farmID];
    }

    function getDurianIDs(uint16 _farmID, uint32 _treeID) external view returns (uint32[] memory) {
        return durianIDs[_farmID][_treeID];
    }

    function containsFarmID(uint16 _farmID) private view returns (bool) {
        for (uint256 i = 0; i < farmIDs.length; i++) {
            if (farmIDs[i] == _farmID) {
                return true;
            }
        }
        return false;
    }

    function containsTreeID(uint16 _farmID, uint32 _treeID) private view returns (bool) {
        for (uint256 i = 0; i < treeIDs[_farmID].length; i++) {
            if (treeIDs[_farmID][i] == _treeID) {
                return true;
            }
        }
        return false;
    }

    function containsDurianID(uint16 _farmID, uint32 _treeID, uint32 _durianID) private view returns (bool) {
        for (uint256 i = 0; i < durianIDs[_farmID][_treeID].length; i++) {
            if (durianIDs[_farmID][_treeID][i] == _durianID) {
                return true;
            }
        }
        return false;
    }
}
