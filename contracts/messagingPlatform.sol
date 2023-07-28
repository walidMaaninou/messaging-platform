// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract MessagingPlatform is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _messageIds;
    Counters.Counter private _publicItems;

    address payable owner;

    mapping(uint256 => MessageItem) private idToMessageItem;

    struct MessageItem {
      uint256 messageId;
      address payable sender;
      address payable receiver;
      bool isPublic;
    }

    event MessageItemSent (
      uint256 indexed messageId,
      address sender,
      address receiver,
      bool isPublic
    );

    constructor() ERC721("Metaverse Messages", "METM") {
      owner = payable(msg.sender);
    }

    /* Mints a message and send it either to the receiver or the whole network */
    function createMessage(string memory messageURI, address receiver) public payable returns (uint) {
      _messageIds.increment();
      uint256 newMessageId = _messageIds.current();

      _mint(msg.sender, newMessageId);
      _setTokenURI(newMessageId, messageURI);
      sendMessageItem(newMessageId, receiver);
      return newMessageId;
    }

    function sendMessageItem(
      uint256 messageId,
      address receiver
    ) private {

        if(receiver == address(0)){
            _publicItems.increment();
            idToMessageItem[messageId] =  MessageItem(
            messageId,
            payable(msg.sender),
            payable(receiver),
            true
            );
            emit MessageItemSent(
                messageId,
                msg.sender,
                receiver,
                true
            );
        } else {
            idToMessageItem[messageId] =  MessageItem(
            messageId,
            payable(msg.sender),
            payable(receiver),
            false
            );
            emit MessageItemSent(
                messageId,
                msg.sender,
                receiver,
                false
            );
        }
      

      
    }

    /* Returns all public messages */
    function fetchMessageItems() public view returns (MessageItem[] memory) {
      uint itemCount = _messageIds.current();
      uint publicItemCount = _publicItems.current();
      uint currentIndex = 0;

      MessageItem[] memory items = new MessageItem[](publicItemCount);
      for (uint i = 0; i < itemCount; i++) {
        if (idToMessageItem[i + 1].isPublic == true) {
          uint currentId = i + 1;
          MessageItem storage currentItem = idToMessageItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    /* Returns only messages that a user has sent */
    function fetchSentMessages() public view returns (MessageItem[] memory) {
      uint totalItemCount = _messageIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMessageItem[i + 1].sender == msg.sender) {
          itemCount += 1;
        }
      }

      MessageItem[] memory items = new MessageItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMessageItem[i + 1].sender == msg.sender) {
          uint currentId = i + 1;
          MessageItem storage currentItem = idToMessageItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    /* Returns only items that a user has received */
    function fetchReceivedMessages() public view returns (MessageItem[] memory) {
      uint totalItemCount = _messageIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMessageItem[i + 1].receiver == msg.sender) {
          itemCount += 1;
        }
      }

      MessageItem[] memory items = new MessageItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMessageItem[i + 1].receiver == msg.sender) {
          uint currentId = i + 1;
          MessageItem storage currentItem = idToMessageItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }
}