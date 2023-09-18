// config.js
module.exports = {
    mongoURI: 'mongodb+srv://durian:durian123@durianchain.xpdlofs.mongodb.net/',
    privateKey: '3d4d43a11ab351b28314e1e7be5b48abb16c607224b440b4c27073924bffc3ca',
    infuraURL: 'https://sepolia.infura.io/v3/2db8bf25ea424b7898c746d2bd37470a',
    contractAddress: '0x45a131181a22fE3aD58A1b878262239e99805afD',
    contractABI: [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_country",
            "type": "string"
          },
          {
            "internalType": "uint32",
            "name": "_postCode",
            "type": "uint32"
          },
          {
            "internalType": "uint16",
            "name": "_farmID",
            "type": "uint16"
          },
          {
            "internalType": "uint32",
            "name": "_treeID",
            "type": "uint32"
          },
          {
            "internalType": "uint8",
            "name": "_durianType",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "_durianID",
            "type": "uint32"
          },
          {
            "internalType": "string",
            "name": "_harvestTime",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_scanTime",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_firstPlant",
            "type": "string"
          },
          {
            "internalType": "uint16",
            "name": "_workerID",
            "type": "uint16"
          }
        ],
        "name": "addDurian",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint16",
            "name": "_farmID",
            "type": "uint16"
          },
          {
            "internalType": "uint32",
            "name": "_treeID",
            "type": "uint32"
          },
          {
            "internalType": "uint8",
            "name": "_rating",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "_comment",
            "type": "string"
          }
        ],
        "name": "addReview",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint16",
            "name": "_farmID",
            "type": "uint16"
          },
          {
            "internalType": "uint32",
            "name": "_treeID",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "_durianID",
            "type": "uint32"
          }
        ],
        "name": "getDurianData",
        "outputs": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "country",
                "type": "string"
              },
              {
                "internalType": "uint32",
                "name": "postCode",
                "type": "uint32"
              },
              {
                "internalType": "uint16",
                "name": "farmID",
                "type": "uint16"
              },
              {
                "internalType": "uint32",
                "name": "treeID",
                "type": "uint32"
              },
              {
                "internalType": "uint8",
                "name": "durianType",
                "type": "uint8"
              },
              {
                "internalType": "uint32",
                "name": "durianID",
                "type": "uint32"
              },
              {
                "internalType": "string",
                "name": "harvestTime",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "scanTime",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "firstPlant",
                "type": "string"
              },
              {
                "internalType": "uint16",
                "name": "workerID",
                "type": "uint16"
              }
            ],
            "internalType": "struct DurianContract.Durian",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint16",
            "name": "_farmID",
            "type": "uint16"
          },
          {
            "internalType": "uint32",
            "name": "_treeID",
            "type": "uint32"
          }
        ],
        "name": "getDurianIDs",
        "outputs": [
          {
            "internalType": "uint32[]",
            "name": "",
            "type": "uint32[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getFarmIDs",
        "outputs": [
          {
            "internalType": "uint16[]",
            "name": "",
            "type": "uint16[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint16",
            "name": "_farmID",
            "type": "uint16"
          },
          {
            "internalType": "uint32",
            "name": "_treeID",
            "type": "uint32"
          }
        ],
        "name": "getReviews",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint8",
                "name": "rating",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "comment",
                "type": "string"
              }
            ],
            "internalType": "struct DurianContract.Review[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint16",
            "name": "_farmID",
            "type": "uint16"
          }
        ],
        "name": "getTreeIDs",
        "outputs": [
          {
            "internalType": "uint32[]",
            "name": "",
            "type": "uint32[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    secretKey: 'e70b8cc25d40bce79065a8bbbdb91cf45500ed0149f7817cf55ec152d3000ac1',
    PORT: 9000,
  };
  