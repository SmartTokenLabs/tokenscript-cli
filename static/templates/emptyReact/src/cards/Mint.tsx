// @ts-nocheck
import React, { useState, useEffect } from "react";
import Loader from "../components/loader/loader";

export const Mint: React.FC = ({ token }) => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(false);
	}, []);

	return (
		<div>
			{token && (
				<div>
					<h3>Mint...</h3>
					<p>
						Actions allow you to invoke a smart contract transaction
						or invoke a Javascript function within the view.
					</p>
				</div>
			)}
			<Loader show={loading} />
		</div>
	);
};
