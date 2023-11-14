//<![CDATA[
class Token {

    constructor(tokenInstance) {
        this.props = tokenInstance;
        this.props.underlyingToken = this.props.label.replace("m", "");
        this.props.rate = (1 / (this.props.exchangeRate / 1e18)).toFixed(2);
    }

    render() {
        const decimals = Math.pow(10, this.props.tokenDecimals);
        const mTokenBalance = (this.props.mTokenBalance / decimals).toFixed(2);
        const tokenBalance = (this.props.tokenBalance / decimals).toFixed(2);
        const APR = ((this.props.supplyInterestRate * 100) / 1e18).toFixed(2);
        return`
        <div class="ui container">
          <div class="ui segment">
            <img src="data:image/png;base64,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"/>
            <span><bold><h3>${this.props.label} Balance: ${mTokenBalance}</h3></bold></span>
            <span><bold><h3>${this.props.underlyingToken} Balance: ${tokenBalance}</h3></bold></span>
            <span><bold><h3>Interest Rate: ${APR}%</h3></bold></span>
            <span><bold><h3>1 ${this.props.underlyingToken} = ${this.props.rate} ${this.props.label}</h3></bold></span>
          </div>
          <div id="inputBox">
              <bold><h3>Supply ${this.props.underlyingToken} to DMM</h3></bold>
              <span><input id="mintAmount" type="number"></span>
          </div>
        </div>
`;
    }
}

web3.tokens.dataChanged = (oldTokens, updatedTokens, tokenIdCard) => {
    const currentTokenInstance = web3.tokens.data.currentInstance;
    document.getElementById(tokenIdCard).innerHTML = new Token(currentTokenInstance).render();
};


//]]>
