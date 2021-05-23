import React, { Component } from "react";
import AuctionContract from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { input: 0,
  					highestBid: 0,
  					auctionBalance: 0,
  					userBalance: 0,
  					highestBidder: null,
  					web3: null, 
  					accounts: null
  				};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      console.log(accounts[0]);

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        AuctionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const hbid = await instance.methods.highestBid().call();
			const hbidder = await instance.methods.highestBidder().call();
			const abalance = await instance.methods.getContractBalance().call();
			const ubalance = await instance.methods.userBalances(accounts[0]).call();
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, 
      								contract: instance,
      								highestBid: hbid,
      								highestBidder: hbidder,
      								auctionBalance: abalance,
      								userBalance: ubalance
      });
    	} catch (error) {
      // Catch any errors for any of the above operations.
      	alert(
        	`Failed to load web3, accounts, or contract. Check console for details.`,
	      );
	      console.error(error);
    	}
  };

  bid = async () => {
  	const { accounts, contract } = this.state;
    // Stores a given value, 5 by default.
    await contract.methods.bid().send({from: accounts[0], value: this.state.input});
  	// Update state with the result.
    
    const hbid = await contract.methods.highestBid().call();
    const hbidder = await contract.methods.highestBidder().call();
		const abalance = await contract.methods.getContractBalance().call();
		const ubalance = await contract.methods.userBalances(accounts[0]).call();
      
		this.setState({ highestBid: hbid,
    								highestBidder: hbidder,
    								auctionBalance: abalance,
    								userBalance: ubalance
   	});
  };
	
	withdraw = async () => {
  	const { accounts, contract } = this.state;
    // Stores a given value, 5 by default.
    await contract.methods.withdraw().send({from: accounts[0]});
  	// Update state with the result.
    const hbid = await contract.methods.highestBid().call();
    const hbidder = await contract.methods.highestBidder().call();
		const abalance = await contract.methods.getContractBalance().call();
		const ubalance = await contract.methods.userBalances(accounts[0]).call();
      
		this.setState({ highestBid: hbid,
    								highestBidder: hbidder,
    								auctionBalance: abalance,
    								userBalance: ubalance
   	});
  };

  myChangeHandler = (event) => {
    this.setState({input: event.target.value}, () => {
      console.log(this.state.input)
    });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className="App">
        <h1>Auction</h1>
        <div>Highest Bid: {this.state.highestBid}</div>
        <div>Highest Bider: {this.state.highestBidder}</div>
        <div>Auction Balance: {this.state.auctionBalance}</div>
        <h2>Bid</h2>
        <div>**Bidding will fail if the owner bids**</div>
        <input type="text" onChange={this.myChangeHandler}/>
        <button onClick={this.bid}>Bid</button>
        <h2>Withdraw</h2>
        <div>Withdraw available ammount: {this.state.userBalance}</div>
        <button onClick={this.withdraw}>Withdraw</button>
      </div>
    );
  }
}

export default App;
