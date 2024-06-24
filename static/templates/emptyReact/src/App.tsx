import React, { useState, useEffect, FC } from "react";
import { Info } from "./cards/Info";
import { Mint } from "./cards/Mint";
import { NotFound } from "./cards/NotFound";

let tokenData: unknown;

const dataChangedHandler = async (
	oldTokens: unknown,
	updatedTokens: unknown
	// cardId: unknown
) => {
	tokenData = updatedTokens;
};

// @ts-ignore
web3.tokens.dataChanged = dataChangedHandler;

const App: FC = () => {
	// add TokenScript Card views here
	enum CardName {
		Info = "#info",
		Mint = "#mint",
		NotFound = "#notFound",
	}

	const [CurrentPageName, setCurrentPageName] = useState<CardName>(
		CardName.Info
	);
	const [token, setToken] = useState();

	const mapCardName = (card: string | null): CardName => {
		switch (card) {
			case CardName.Info:
				return CardName.Info;
			case CardName.Mint:
				return CardName.Mint;
			default:
				return CardName.NotFound;
		}
	};

	const cardComponents: { [key in CardName]: React.FC } = {
		[CardName.Info]: Info,
		[CardName.Mint]: Mint,
		[CardName.NotFound]: NotFound,
	};

	const CurrentPage = cardComponents[CurrentPageName];

	useEffect(() => {
		const routeChange = () => {
			const card = document.location.hash;
			const mappedCardName = mapCardName(card);
			setCurrentPageName(mappedCardName);
		};

		// @ts-expect-error - web3 is not defined
		web3.tokens.dataChanged = dataChangedHandler;

		// @ts-ignore
		if (tokenData && tokenData.currentInstance !== undefined) {
			// @ts-ignore
			setToken(tokenData.currentInstance);
		}

		window.addEventListener("hashchange", routeChange);
		routeChange(); // Handle initial load

		return () => {
			window.removeEventListener("hashchange", routeChange);
		};
	}, []);

	// @ts-ignore
	return <CurrentPage token={token} />;
};

export default App;
