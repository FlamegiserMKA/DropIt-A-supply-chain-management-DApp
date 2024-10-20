import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

//Internal Import
import tracking from "../Context/Tracking.json";
const ContractAddress = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";
const ContractABI = tracking.abi;

//Fetching the contract
const fetchContract = (signerOrProvider) =>
    new ethers.Contract(ContractAddress, ContractABI, signerOrProvider);

export const TrackingContext = React.createContext();

export const TrackingProvider = ({ children }) =>{
    //State Variable
    const DappName = "Product Tracking Dapp";
    const [currentUser, setCurrentUser] = useState("");

    const createShipment = async (items) =>{
        console.log(items);
        const{ receiver, pickupTime, distance, price } = items;

        try{
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            const createItem = await contract.createShipment(
                receiver,
                new Date(pickupTime).getTime(),
                distance,
                ethers.utils.parseUnits(price,18),
                {
                    value: ethers.utils.parseUnits(price, 18),
                }
            );
            await createItem.wait();
            console.log(createItem);
        }catch (error) {
            console.log("Something went wrong",error);
        }
    };

    const getAllShipment = async() => {
        try{
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);

            const shipments = await contract.getAllTransactions();
            const allShipments = shipments.map((shipment) => ({
                sender: shipment.sender,
                receiver: shipment.receiver,
                price: ethers.utils.formatEther(shipment.price.toString()),
                pickupTime: shipment.pickupTime.toNumber(),
                deliveryTime: shipment.deliveryTime.toNumber(),
                distance: shipment.distance.tonumber(),
                isPaid: shipment.isPaid,
                status: shipment.status,
            }));
            return allShipments;
        }catch (error) {
            console.log("Error getting shipment");
        }
    };
    
    const getShipmentsCount = async() =>{
        try{
            if(!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);
            const shipmentsCount = await contract.getShipmentsCount(accounts[0]);
            return shipmentsCount.toNumber();
        }catch (error) {
            console.log("Error went getting shipments");
        }
    };

    const completeShipment = async(completeShip) =>{
        console.log(completeShip);

        const{ receiver, index } = completeShip;
        try{
            if(!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            const transaction = await contract.completeShipment(
                accounts[0],
                receiver,
                index,
                {
                    gasLimit: 30000,
                }
            );
            transaction.wait();
            console.log(transaction);
        }catch (error) {
            console.log("wrong completeshipment",error);
        }
    };

    const getShipment = async(index) =>{
        console.log(index*1);
        try{
            if(!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });

            const provider = new ethers.providers.JasonRpcProvider();
            const contract = fetchContract(provider);
            const shipment = await ContractFactory.getShipment(account[0], index*1);

            const shipmentList = {
                sender: shipment[0],
                receiver: shipment[1],
                pickupTime: shipment[2].toNumber(),
                deliverTime: shipment[3].toNumber(),
                distance: shipment[4].toNumber(),
                price: ethers.utils.formatEther(shipment[5].toString()),
                status: shipment[6],
                isPaid: shipment[7],
            };
            return shipmentList;
        }catch (error) {
            console.log("Sorry no shipment");
        }
    };

    const startShipment = async(getProsuct) =>{
        const{ receiver, index} = getProduct;
        try{
            if(!window.ethereum) return "Install MetaMask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            const shipment = await contract.startShipment(
                accounts[0],
                receiver,
                index*1,
            );

            shipment.wait();
            console.log(shipment);
        }catch {error} {
            console.log("Sorry no shipment", error);
        }
    };

    //Check wallet connection
    const checkIfWalletConnected = async() =>{
        try{
            if(!window.ethereum) return "Install MetaMask";

            const accounts = await window.ethereum.request({
                method:"eth_accounts",
            });

            if(accounts.length){
                setCurrentUser(accounts[0]);
            }
            else{
                return "No account";
            }
        }catch (error){
            return "Not Connected";
        }
    };
    //Connect Wallet Function
    const connectWallet = async() =>{
        try{
            if(!window.ethereum) return "Install MetaMask";

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            setCurrentUser(accounts[0]);
        }catch (error) {
            console.log("Something went wrong");
        }
    };

    useEffect(() =>{
        checkIfWalletConnected();
    }, []);

    return(
        <TrackingContext.Provider
        value={{
            connectWallet,
            createShipment,
            getAllShipment,
            completeShipment,
            getShipment,
            startShipment,
            getShipmentsCount,
            DappName,
            currentUser,
        }}
        >
            {children}
        </TrackingContext.Provider>
    );
 };